import writeFile from "./writefile.ts";

const addr =
  "https://raw.githubusercontent.com/felixonmars/dnsmasq-china-list/master/apple.china.conf";

const meta = {
  title: "Apple CDN",
  source: "https://github.com/felixonmars/dnsmasq-china-list",
  content: "",
  path: "/Ruleset/CDN/Apple.list",
};

export default async function build() {
  const data = await parse();
  const list = data.map((v) => {
    return `DOMAIN-SUFFIX,${v}\n`;
  });
  await writeFile({ ...meta, content: list.join("") });
}

export async function parse() {
  const resp = await fetch(addr);
  const body = await resp.text();
  return body.split("\n").map((v) => {
    if (!v.startsWith("server=/") || !v.endsWith("/114.114.114.114")) return "";
    return v.substring("server=/".length, v.length - "/114.114.114.114".length);
  }).filter((v) => v !== "");
}
