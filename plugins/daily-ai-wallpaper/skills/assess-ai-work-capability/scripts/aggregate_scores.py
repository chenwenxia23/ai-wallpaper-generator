#!/usr/bin/env python3
"""Aggregate evidence-based AI work capability ratings deterministically."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Any


DIMENSIONS = {
    "framing": ("目标与问题定义", 15),
    "context": ("上下文与约束", 12),
    "delegation": ("拆解与委派", 13),
    "execution": ("工具与执行杠杆", 15),
    "verification": ("验证与批判判断", 20),
    "recovery": ("迭代与失败恢复", 10),
    "compounding": ("沉淀与复用", 15),
}

LEVELS = [
    (85, 5, "L5 前沿驾驭者"),
    (70, 4, "L4 系统化使用者"),
    (55, 3, "L3 协作执行者"),
    (40, 2, "L2 熟练问答者"),
    (0, 1, "L1 起步使用者"),
]


def load_input(source: str) -> dict[str, Any]:
    if source == "-":
        return json.load(sys.stdin)
    return json.loads(Path(source).read_text(encoding="utf-8"))


def clamp(value: float, low: float, high: float) -> float:
    return max(low, min(high, value))


def raw_level(score: float) -> tuple[int, str]:
    for threshold, number, label in LEVELS:
        if score >= threshold:
            return number, label
    raise AssertionError("unreachable")


def label_for(number: int) -> str:
    return next(label for _, level, label in LEVELS if level == number)


def require_number(data: dict[str, Any], key: str, default: float = 0) -> float:
    value = data.get(key, default)
    if isinstance(value, bool) or not isinstance(value, (int, float)):
        raise ValueError(f"{key} must be a number")
    if value < 0:
        raise ValueError(f"{key} must be non-negative")
    return float(value)


def aggregate(data: dict[str, Any]) -> dict[str, Any]:
    ratings = data.get("dimensions")
    if not isinstance(ratings, dict):
        raise ValueError("dimensions must be an object")

    weighted_points = 0.0
    observed_weight = 0.0
    normalized: dict[str, Any] = {}

    for dimension_id, (name, weight) in DIMENSIONS.items():
        value = ratings.get(dimension_id)
        if value is None or value == "N/O":
            normalized[dimension_id] = {
                "name": name,
                "rating": "N/O",
                "weight": weight,
            }
            continue
        if isinstance(value, bool) or not isinstance(value, (int, float)):
            raise ValueError(f"dimension {dimension_id} must be 0-4 or N/O")
        rating = float(value)
        if rating < 0 or rating > 4:
            raise ValueError(f"dimension {dimension_id} must be between 0 and 4")
        weighted_points += weight * rating / 4
        observed_weight += weight
        normalized[dimension_id] = {
            "name": name,
            "rating": round(rating, 2),
            "weight": weight,
        }

    if observed_weight == 0:
        raise ValueError("at least one dimension must be observed")

    coverage = observed_weight
    score = weighted_points / observed_weight * 100
    score = round(score, 1)

    episode_count = require_number(data, "episode_count")
    task_type_count = require_number(data, "task_type_count")
    verified_outcomes = require_number(data, "verified_outcome_count")
    complex_episodes = require_number(data, "complex_episode_count")
    date_span_days = require_number(data, "date_span_days")

    confidence = (
        25 * coverage / 100
        + 20 * min(episode_count / 20, 1)
        + 15 * min(task_type_count / 5, 1)
        + 25 * min(verified_outcomes / 8, 1)
        + 15 * min(date_span_days / 30, 1)
    )
    confidence = round(clamp(confidence, 0, 100), 1)
    if confidence >= 75:
        confidence_label = "高"
    elif confidence >= 50:
        confidence_label = "中"
    else:
        confidence_label = "低"

    proposed_number, proposed_label = raw_level(score)
    final_number = proposed_number
    gates: list[str] = []

    verification = ratings.get("verification")
    compounding = ratings.get("compounding")
    verification_value = float(verification) if isinstance(verification, (int, float)) and not isinstance(verification, bool) else -1
    compounding_value = float(compounding) if isinstance(compounding, (int, float)) and not isinstance(compounding, bool) else -1

    if proposed_number >= 5:
        l5_ok = (
            verification_value >= 3.2
            and compounding_value >= 3.0
            and verified_outcomes >= 3
            and complex_episodes >= 3
            and coverage >= 85
        )
        if not l5_ok:
            final_number = min(final_number, 4)
            gates.append("未满足 L5 的验证、沉淀、复杂任务、结果或覆盖率门槛")

    if final_number >= 4:
        l4_ok = (
            verification_value >= 2.5
            and verified_outcomes >= 1
            and complex_episodes >= 2
            and coverage >= 70
        )
        if not l4_ok:
            final_number = min(final_number, 3)
            gates.append("未满足 L4 的验证、复杂任务、结果或覆盖率门槛")

    requested_cap = data.get("level_cap")
    if requested_cap is not None:
        if isinstance(requested_cap, bool) or not isinstance(requested_cap, int) or not 1 <= requested_cap <= 5:
            raise ValueError("level_cap must be an integer from 1 to 5")
        if final_number > requested_cap:
            final_number = requested_cap
            gates.append(f"因明确风险信号，评级上限设为 L{requested_cap}")

    if coverage < 40 or episode_count < 5:
        if final_number > 2:
            final_number = 2
            gates.append("观察覆盖率低于 40% 或任务样本少于 5 个，评级最高为 L2")
    elif coverage < 70 and final_number > 3:
        final_number = 3
        gates.append("观察覆盖率低于 70%，评级最高为 L3")

    qualifier = "暂定" if confidence < 50 else ""
    final_label = label_for(final_number)
    if qualifier:
        final_label = f"{qualifier}{final_label}"

    return {
        "score": score,
        "proposed_level": proposed_label,
        "final_level": final_label,
        "coverage_percent": round(coverage, 1),
        "confidence": confidence,
        "confidence_label": confidence_label,
        "gates": gates,
        "dimensions": normalized,
        "sample": {
            "episode_count": episode_count,
            "task_type_count": task_type_count,
            "complex_episode_count": complex_episodes,
            "verified_outcome_count": verified_outcomes,
            "date_span_days": date_span_days,
        },
    }


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--input", required=True, help="JSON file path, or - for stdin")
    parser.add_argument("--compact", action="store_true", help="emit compact JSON")
    args = parser.parse_args()

    try:
        result = aggregate(load_input(args.input))
    except (OSError, json.JSONDecodeError, ValueError) as exc:
        print(f"error: {exc}", file=sys.stderr)
        return 2

    if args.compact:
        print(json.dumps(result, ensure_ascii=False, separators=(",", ":")))
    else:
        print(json.dumps(result, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
