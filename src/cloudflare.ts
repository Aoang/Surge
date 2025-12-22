import writeFile from "./writefile.ts";

const ipsV4 = "https://www.cloudflare.com/ips-v4";
const ipsV6 = "https://www.cloudflare.com/ips-v6";

const meta = {
  title: "Cloudflare CDN",
  source: "https://www.cloudflare.com/ips",
  content: "",
  path: "/Ruleset/CDN/Cloudflare.list",
};

export default async function build() {
  const v4 = (await parse(ipsV4)).map((v) => {
    return `IP-CIDR,${v}\n`;
  });
  const v6 = (await parse(ipsV6)).map((v) => {
    return `IP-CIDR6,${v}\n`;
  });
  await writeFile({ ...meta, content: v4.concat(v6).join("") });
}

export async function parse(addr: string) {
  const resp = await fetch(addr);
  const body = await resp.text();
  return body.split("\n").map((v) => {
    if (!v || v === "") return "";
    return v;
  }).filter((v) => v !== "").concat(["1.0.0.1/32", "1.1.1.1/32"]);
}
