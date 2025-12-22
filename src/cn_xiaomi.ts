import writeFile from "./writefile.ts";
import hp from "./hosts.ts";

const meta = {
  title: "Xiaomi",
  source:
    "https://raw.githubusercontent.com/jerryn70/GoodbyeAds/master/Extension/GoodbyeAds-Xiaomi-Extension.txt",
  content: "",
  path: "/Ruleset/Block/Xiaomi.set",
};

export default async function build() {
  const data = await parse();
  await writeFile({ ...meta, content: data.join("\n") });
}

export async function parse() {
  return await hp([
    "https://raw.githubusercontent.com/jerryn70/GoodbyeAds/master/Extension/GoodbyeAds-Xiaomi-Extension.txt",
  ]);
}
