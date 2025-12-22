import { parse } from "./ad_guard.ts";

Deno.test(async function testParse() {
  const data = await parse();
  console.log(data.length);
});
