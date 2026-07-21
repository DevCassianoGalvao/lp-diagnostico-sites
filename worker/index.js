const worker = {
  async fetch(request, env) {
    const url = new URL(request.url);
    const isAsset = url.pathname.includes(".");

    if (url.pathname === "/") url.pathname = "/index.html";
    const response = await env.ASSETS.fetch(new Request(url, request));

    if (response.status !== 404 || isAsset) return withCorrectContentType(response, url.pathname);

    url.pathname = "/index.html";
    return env.ASSETS.fetch(new Request(url, request));
  }
};

function withCorrectContentType(response, pathname) {
  if (!pathname.toLowerCase().endsWith(".webp")) return response;

  const headers = new Headers(response.headers);
  headers.set("Content-Type", "image/webp");
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}

export default worker;
