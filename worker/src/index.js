/**
 * Path proxy: rubinmex.com/wcacapulco2027/* → wcacapulco2027.pages.dev/*
 */
const ORIGIN = "https://wcacapulco2027.pages.dev";
const PREFIX = "/wcacapulco2027";

export default {
  async fetch(request) {
    const url = new URL(request.url);

    if (url.pathname === PREFIX) {
      url.pathname = PREFIX + "/";
      return Response.redirect(url.toString(), 301);
    }

    if (!url.pathname.startsWith(PREFIX + "/")) {
      return new Response("Not Found", { status: 404 });
    }

    const upstreamPath = url.pathname.slice(PREFIX.length) || "/";
    const target = new URL(upstreamPath + url.search, ORIGIN);

    const headers = new Headers(request.headers);
    headers.delete("host");
    headers.set("host", "wcacapulco2027.pages.dev");

    const init = {
      method: request.method,
      headers,
      redirect: "manual",
    };
    if (request.method !== "GET" && request.method !== "HEAD") {
      init.body = request.body;
    }

    const upstream = await fetch(target.toString(), init);
    const outHeaders = new Headers(upstream.headers);
    const location = outHeaders.get("location");
    if (location) {
      try {
        const loc = new URL(location, ORIGIN);
        if (loc.hostname === "wcacapulco2027.pages.dev") {
          loc.protocol = url.protocol;
          loc.host = url.host;
          loc.pathname = PREFIX + (loc.pathname === "/" ? "/" : loc.pathname);
          outHeaders.set("location", loc.toString());
        }
      } catch (_) {}
    }

    return new Response(upstream.body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: outHeaders,
    });
  },
};
