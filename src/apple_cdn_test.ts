import { parse } from "./apple_cdn.ts";

Deno.test(async function testParse() {
  const data = await parse();
  console.log(data.length, data);
});
