import * as http from "@std/http";

Deno.serve((req) => {
  const pathname = new URL(req.url).pathname;
  if (
    pathname.startsWith("/Modules") || pathname.startsWith("/Ruleset") ||
    pathname.startsWith("/Script") || pathname.startsWith("/Icon")
  ) {
    return http.serveDir(req);
  }

  return new Response(`${new Date().toString()}`);
});
