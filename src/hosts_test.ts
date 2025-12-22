import parse from "./hosts.ts";

Deno.test(async function testParse() {
  const arr = await parse([
    "https://raw.githubusercontent.com/jerryn70/GoodbyeAds/master/Extension/GoodbyeAds-Xiaomi-Extension.txt",
  ]);
  console.log(arr.length);
});
