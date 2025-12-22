import compile from "npm:@adguard/hostlist-compiler";
import { NetworkFilter } from "npm:@ghostery/adblocker";

export default async function parse(address: string[]) {
  const data = await compile({
    name: "list",
    sources: address.map((v) => ({
      type: "adblock",
      source: v,
      transformations: ["RemoveComments", "Validate"],
    })),
    transformations: [
      "RemoveComments",
      "Compress",
      "Validate",
      "Deduplicate",
      "RemoveEmptyLines",
      "TrimLines",
    ],
  }) as string[];

  const whitelist = new Set<string>();

  const res = data.map((v) => {
    const val = NetworkFilter.parse(v);
    const hostname = val?.getHostname();
    if (
      !val ||
      !hostname ||
      val.isElemHide() || val.isGenericHide() || val.isSpecificHide() ||
      val.isRedirect() || val.isRedirectRule() ||
      val.hasDomains() ||
      val.isCSP() || !val.isPlain() ||
      (!val.fromAny() && !val.fromDocument()) ||
      val.isRegex() || val.isFullRegex()
    ) return "";

    if (val.isException()) {
      whitelist.add(hostname);
      return "";
    }
    return hostname;
  }).filter((v) => v !== "");

  const blacklist = new Set<string>();

  res.forEach((v) => {
    if (!whitelist.has(v)) blacklist.add(`.${v}`);
  });

  return Array.from(blacklist);
}
