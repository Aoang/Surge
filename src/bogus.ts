import writeFile from "./writefile.ts";

const addr =
  "https://raw.githubusercontent.com/felixonmars/dnsmasq-china-list/master/bogus-nxdomain.china.conf";

const meta = {
  title: "Bogus",
  source: "https://github.com/felixonmars/dnsmasq-china-list",
  content: "",
  path: "/Ruleset/Block/Bogus.list",
};

export default async function build() {
  const data = await parse();
  const list = data.map((v) => {
    return `IP-CIDR,${v}/32,no-resolve\n`;
  });
  await writeFile({ ...meta, content: list.join("") });
}

export async function parse() {
  const resp = await fetch(addr);
  const body = await resp.text();
  return body.split("\n").map((v) => {
    if (!v.startsWith("bogus-nxdomain=")) return "";
    return v.replace("bogus-nxdomain=", "");
  }).filter((v) => v !== "");
}
