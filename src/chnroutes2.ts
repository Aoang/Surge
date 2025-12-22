import writeFile from "./writefile.ts";

const addr =
  "https://raw.githubusercontent.com/misakaio/chnroutes2/master/chnroutes.txt";

const meta = {
  title: "China CIDR",
  source: "https://misaka.io",
  content: "",
  path: "/Ruleset/China/China.list",
};

export default async function build() {
  const data = await parse();
  const list = data.map((v) => {
    return `IP-CIDR,${v}\n`;
  });
  await writeFile({ ...meta, content: list.join("") });
}

export async function parse() {
  const resp = await fetch(addr);
  const body = await resp.text();
  return body.split("\n").filter((v) => {
    if (!v) return false;
    return !v.startsWith("#");
  });
}
