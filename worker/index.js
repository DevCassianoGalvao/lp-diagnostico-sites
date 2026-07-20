const worker = {
  async fetch(request, env) {
    const url = new URL(request.url);
    const isAsset = url.pathname.includes(".");

    if (url.pathname === "/") url.pathname = "/index.html";
    const response = await env.ASSETS.fetch(new Request(url, request));

    if (response.status !== 404 || isAsset) return response;

    url.pathname = "/index.html";
    return env.ASSETS.fetch(new Request(url, request));
  }
};

export default worker;
