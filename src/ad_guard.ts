import writeFile from "./writefile.ts";
import adbParse from "./adblock.ts";

const meta = {
  title: "Base",
  source: "EasyList, AdGuard",
  content: "",
  path: "/Ruleset/Block/Base.set",
};

export default async function build() {
  const data = await parse();
  const set = new Set(data);

  set.add(".log.aliyuncs.com");

  set.add("cls.tencentcloudapi.com");
  set.add("cls.ap-guangzhou.tencentcloudapi.com");
  set.add("cls.ap-shanghai.tencentcloudapi.com");
  set.add("cls.ap-beijing.tencentcloudapi.com");
  set.add("cls.ap-chengdu.tencentcloudapi.com");
  set.add("cls.ap-chongqing.tencentcloudapi.com");
  set.add("cls.ap-hongkong.tencentcloudapi.com");
  set.add("cls.ap-singapore.tencentcloudapi.com");
  set.add("cls.ap-bangkok.tencentcloudapi.com");
  set.add("cls.ap-seoul.tencentcloudapi.com");
  set.add("cls.ap-tokyo.tencentcloudapi.com");
  set.add("cls.na-ashburn.tencentcloudapi.com");
  set.add("cls.na-siliconvalley.tencentcloudapi.com");
  set.add("cls.eu-frankfurt.tencentcloudapi.com");
  set.add("cls.ap-shanghai-fsi.tencentcloudapi.com");
  set.add("cls.ap-shenzhen-fsi.tencentcloudapi.com");

  await writeFile({ ...meta, content: Array.from(set).join("\n") });
}

export async function parse() {
  return await adbParse([
    "https://adguardteam.github.io/AdGuardSDNSFilter/Filters/filter.txt",
    "https://easylist.to/easylist/easylist.txt",
    "https://easylist.to/easylist/easyprivacy.txt",
  ]);
}
