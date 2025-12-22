import { parse } from "./cn_xiaomi.ts";

Deno.test(async function testParse() {
  const data = await parse();
  console.log(data.length);
});
