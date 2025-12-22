import { parse } from "./chnroutes2.ts";

Deno.test(async function testParse() {
  const data = await parse();
  console.log(data.length);
});
