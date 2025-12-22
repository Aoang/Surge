import parse from "./adblock.ts";

Deno.test(async function testParse() {
  const arr = await parse([
    "https://adguardteam.github.io/AdGuardSDNSFilter/Filters/filter.txt",
    "https://easylist.to/easylist/easylist.txt",
  ]);

  console.log(arr.length);
});
