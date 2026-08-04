export default {
  async fetch(request, env) {
    let response = await env.ASSETS.fetch(request);
    const acceptsHtml = request.headers.get("accept")?.includes("text/html");

    if (response.status === 404 && acceptsHtml && ["GET", "HEAD"].includes(request.method)) {
      const indexUrl = new URL(request.url);
      indexUrl.pathname = "/index.html";
      indexUrl.search = "";
      response = await env.ASSETS.fetch(new Request(indexUrl, request));
    }

    if (request.method !== "HEAD" && response.headers.get("content-type")?.includes("text/html")) {
      const html = await response.text();
      const ogImageUrl = new URL("/og.png", request.url).href;
      return new Response(html.replaceAll("__OG_IMAGE_URL__", ogImageUrl), {
        status: response.status,
        headers: response.headers,
      });
    }

    return response;
  },
};
