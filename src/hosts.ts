import compile from "npm:@adguard/hostlist-compiler";

export default async function parse(address: string[]) {
  const data = await compile({
    name: "list",
    sources: address.map((v) => ({
      type: "hosts",
      source: v,
      transformations: ["RemoveComments", "Validate"],
    })),
    transformations: [
      "RemoveComments",
      "Validate",
      "Deduplicate",
      "RemoveEmptyLines",
      "TrimLines",
    ],
  }) as string[];

  return data.map((v) => {
    if (!v || v.startsWith("!")) return "";
    return v.split(" ")[1];
  }).filter((v) => v !== "");
}
