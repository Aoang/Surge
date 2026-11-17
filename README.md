# Surge

继 [神机策略](https://github.com/DivineEngine/Profiles) 之后的自用 Surge
规则与模块合集，对常用服务做了拆分和按需维护，方便在配置中灵活组合。

## 配置面板

打开 [配置面板](https://surge.x2ox.com/)，选择 macOS / iOS 与推荐方案：

- **日常分流**：国内 IP、Apple、Teams 直连，Telegram、PayPal、OneDrive、软件下载使用代理，其他请求默认代理。
- **代理优先**：局域网与 macOS 下载器 / 隧道进程直连，其他请求默认代理。
- **直连净化**：无需节点，所有请求直连，保留基础广告与无效响应 IP 拦截。

填写 HTTPS Surge 订阅地址，或粘贴 Surge `[Proxy]` 格式的节点行。
订阅应为 Surge 配置或节点列表，Clash YAML、Base64 通用订阅、分享链接不能直接使用。
订阅地址和节点密码只在页面内存中处理，不上传、不保存；导出的配置会包含这些信息。

调整服务策略、拦截项目、DNS、IPv6 或自定义规则后，面板进入自定义模式。
重新选择推荐方案会重置分流、拦截和自定义规则，保留节点与网络设置。
配置通过输入检查后可以实时预览、复制和下载 `.conf` 文件。
在 Surge 中导入文件，使用**规则模式**，等待远程规则与节点加载完成，再选择代理节点。
面板检查地址、节点行结构、策略引用、域名与网段；节点协议参数和远程资源内容仍由 Surge 验证。

### 分流顺序

Surge 从上到下匹配，第一条命中的规则决定出口：

1. 自定义规则（例如广告误拦截的直连例外）。
2. 局域网直连。
3. 广告与无效响应 IP 拦截。
4. macOS 下载器、隧道进程直连；iOS 不生成此规则。
5. 服务分流，Apple CDN 优先于 Apple 服务。
6. 国内 IP / GEOIP CN 直连（可关闭，允许 DNS 解析）。
7. `FINAL` 兜底，`dns-failed` 允许解析失败时交给兜底策略。

Apple、Apple CDN、Cloudflare、OneDrive 等文件含规则行，使用 `RULE-SET`；
基础广告、小米广告与软件下载文件是域名列表，使用 `DOMAIN-SET`。
Cloudflare 覆盖大量无关网站，默认关闭；启用后使用 `no-resolve`。
PayPal 等代理服务各自生成手动策略组，复用 Proxy 节点列表，可单独固定节点。
选择“不单独分流”会省略该服务的专用规则，让请求继续匹配后面的规则。
模块在 Surge 中单独安装，不自动启用 MITM，也不写入下载的配置。

配置语义参考 [Surge 规则手册](https://manual.nssurge.com/rules/overview.html)、
[规则集](https://manual.nssurge.com/rules/ruleset.html)、
[外部策略与组复用](https://manual.nssurge.com/policy-groups/policy-including.html)
和 [模块](https://manual.nssurge.com/profile/module.html)。

## 开发

构建服务使用 Node.js 24 与 pnpm workspace。每种远程规则转换位于独立包中，

```shell
pnpm install
pnpm check
pnpm build

# 本地开发面板
pnpm dev
# 只构建面板（不下载远程规则）
pnpm build:panel
```

`pnpm build` 先更新远程规则，再将面板构建到 `output/index.html` 和 `output/assets/`，
保留既有的 Ruleset、Modules、Script、Icon 与 CNAME。页面与 bundle 不提交生成物。
GitHub Pages 工作流发布整个 `output` 目录。
设置 `SURGE_OUTPUT_DIR` 可以将生成结果写入其他目录，相对路径以 workspace 根目录为基准（手动维护的资源仍在 `output/`）。

### Workspace

- `apps/builder`：构建编排 CLI
- `apps/panel`：Vite / React 配置面板与配置生成器
- `packages/core`：网络请求与规则文件输出
- `packages/apple-cdn`：Apple CDN dnsmasq 转换
- `packages/bogus`：Bogus NXDOMAIN 转换
- `packages/china`：中国大陆 IPv4 / IPv6 CIDR 转换
- `packages/cloudflare`：Cloudflare IPv4/IPv6 转换
- `packages/download`：常用软件下载域名集合
- `packages/telegram`：Telegram 域名及官方 CIDR 转换
- `packages/xiaomi`：Xiaomi hosts 转换
- `packages/base-set`：Base.set 广告规则转换

## 目录

- **Ruleset 规则集**
  - Apple
  - CDN（Apple / Cloudflare）
  - Process
  - Telegram
  - PayPal
  - China
  - Microsoft（OneDrive / Teams）
  - Block（Base / Bogus / Parallels / Xiaomi / YouTube）
- **Modules 模块**
  - 排除保留 IP 段
  - Google.cn 重定向
  - 隐藏 VPN 图标
  - MitM 开启
  - 绕过 FakeIP
  - 跳过代理
- **LICENSE**

---

## Ruleset 规则集

### Apple

```ini
# https://surge.x2ox.com/Ruleset/Apple/Apple.list
RULE-SET,https://surge.x2ox.com/Ruleset/Apple/Apple.list,Direct
```

- **维护方式**: 手动维护
- **用途**: 针对 Apple 服务的域名规则，方便单独调整直连 / 代理策略

---

### CDN

#### Apple CDN

```ini
# https://surge.x2ox.com/Ruleset/CDN/Apple.list
RULE-SET,https://surge.x2ox.com/Ruleset/CDN/Apple.list,Direct
```

- **维护方式**: 自动维护，数据源自 dnsmasq-china-list
- **用途**: Apple 相关下载 / 更新等 CDN 流量，可按需直连或走特定节点

#### Cloudflare CDN

```ini
# https://surge.x2ox.com/Ruleset/CDN/Cloudflare.list
RULE-SET,https://surge.x2ox.com/Ruleset/CDN/Cloudflare.list,Direct
```

- **维护方式**: 自动维护，数据源自 Cloudflare 官方 IPv4 / IPv6 网段
- **用途**: Cloudflare 相关 CDN 流量的分流控制

---

### Process

```ini
# https://surge.x2ox.com/Ruleset/Process/Process.list
RULE-SET,https://surge.x2ox.com/Ruleset/Process/Process.list,Direct
```

- **维护方式**: 手动维护
- **用途**: 常见不需要走代理的 APP / 进程，例如 P2P 下载、隧道类程序

---

### Telegram

```ini
# https://surge.x2ox.com/Ruleset/Telegram/Telegram.list
RULE-SET,https://surge.x2ox.com/Ruleset/Telegram/Telegram.list,Proxy HK
```

- **维护方式**: 域名及补充网段内置，CIDR 自动更新自
  [Telegram](https://core.telegram.org/resources/cidr.txt)
- **用途**: Telegram 域名及 IP CIDR，可按需路由到低延迟节点

---

### PayPal

```ini
# https://surge.x2ox.com/Ruleset/PayPal/PayPal.list
RULE-SET,https://surge.x2ox.com/Ruleset/PayPal/PayPal.list,Proxy US
```

- **维护方式**: 手动维护
- **用途**: PayPal 相关域名，一般会分配固定 IP 的代理组以减少风控

---

### China

#### IPv4

```ini
# https://surge.x2ox.com/Ruleset/China/China.list
RULE-SET,https://surge.x2ox.com/Ruleset/China/China.list,Direct
```

- **维护方式**: 自动维护，数据源自
  [misakaio/chnroutes2](https://github.com/misakaio/chnroutes2)
- **用途**: 国内 IP CIDR 直连
- **建议顺序**: 通常放在拦截规则之后，以避免拦截规则失效

#### IPv6

```ini
# https://surge.x2ox.com/Ruleset/China/China6.list
RULE-SET,https://surge.x2ox.com/Ruleset/China/China6.list,Direct
```

- **维护方式**: 自动维护，数据源自
  [gaoyifan/china-operator-ip](https://gaoyifan.github.io/china-operator-ip/china6.txt)
- **用途**: 国内 IPv6 CIDR 直连，规则类型为 `IP-CIDR6`

---

### Microsoft

#### OneDrive

```ini
# https://surge.x2ox.com/Ruleset/Microsoft/OneDrive.list
RULE-SET,https://surge.x2ox.com/Ruleset/Microsoft/OneDrive.list,Proxy US
```

- **维护方式**: 手动维护
- **用途**: OneDrive 相关域名，方便针对性设置代理策略

#### Teams

```ini
# https://surge.x2ox.com/Ruleset/Microsoft/Teams.list
RULE-SET,https://surge.x2ox.com/Ruleset/Microsoft/Teams.list,Direct
```

- **维护方式**: 手动维护
- **用途**: Teams 会议 / 协作服务的流量分流

---

### Block

#### Base

```ini
# https://surge.x2ox.com/Ruleset/Block/Base.set
DOMAIN-SET,https://surge.x2ox.com/Ruleset/Block/Base.set,Reject
```

- **维护方式**: 自动维护，数据源自 [AdGuard](https://adguard.com) 与
  [EasyList](https://easylist.to) 的基础规则
- **用途**: 基础广告、隐私保护规则，一般放在特殊规则后、出口规则前
- **说明**: 只处理 host 相关规则，出于性能等考虑，不能完全替代插件

#### Bogus

```ini
# https://surge.x2ox.com/Ruleset/Block/Bogus.list
RULE-SET,https://surge.x2ox.com/Ruleset/Block/Bogus.list,Reject
```

- **维护方式**: 自动维护，数据源自
  [felixonmars/dnsmasq-china-list](https://github.com/felixonmars/dnsmasq-china-list)

#### Parallels

```ini
# https://surge.x2ox.com/Ruleset/Block/Parallels.list
RULE-SET,https://surge.x2ox.com/Ruleset/Block/Parallels.list,Reject
```

- **维护方式**: 手动维护
- **用途**: 屏蔽 Parallels 相关网址

#### Xiaomi

```ini
# https://surge.x2ox.com/Ruleset/Block/Xiaomi.set
DOMAIN-SET,https://surge.x2ox.com/Ruleset/Block/Xiaomi.set,Reject
```

- **维护方式**: 自动维护，数据源自
  [jerryn70/GoodbyeAds](https://github.com/jerryn70/GoodbyeAds)

#### YouTube

```ini
# https://surge.x2ox.com/Ruleset/Block/YouTube.list
RULE-SET,https://surge.x2ox.com/Ruleset/Block/YouTube.list,Reject
```

- **维护方式**: 手动维护
- **说明**: 不推荐使用，规则对现实广告拦截帮助有限

---

## Modules 模块

> 将以下地址直接加入 Surge 的模块配置中即可使用。

### 排除保留 IP 段

```ini
https://surge.x2ox.com/Modules/exclude_cidr.sgmodule
```

- **用途**: 排除内网保留 IP 段，避免错误走代理

### Google.cn 重定向

```ini
https://surge.x2ox.com/Modules/google_cn.sgmodule
```

- **用途**: 将不可用的 `google.cn` 服务重定向至 `google.com`

### 隐藏 VPN 图标

```ini
https://surge.x2ox.com/Modules/hide_vpn_icon.sgmodule
```

- **平台**: iOS 可用
- **用途**: 隐藏系统状态栏中的 VPN 图标

### MitM 开启

```ini
https://surge.x2ox.com/Modules/mitm.sgmodule
```

- **用途**: 对所有域名开启 MitM（常见不可 MitM 的域名已排除）
- **警告**: 不推荐随意使用，仅在明确了解 MitM 风险与用途时开启

### 绕过 FakeIP

```ini
https://surge.x2ox.com/Modules/real_ip.sgmodule
```

- **用途**: 为 FakeIP 不可用的服务启用真实 IP，如 stun / Tailscale 等

### 跳过代理

```ini
https://surge.x2ox.com/Modules/skip_proxy.sgmodule
```

- **用途**: 对内网网段跳过代理

---

## LICENSE

- `https://surge.x2ox.com/Ruleset/China/China.list` 保持原有协议 **CC BY-SA
  2.0**
- `https://surge.x2ox.com/Ruleset/Block/Base.set` 及相关处理代码保持原有协议
  **GPLv3**
- 其余内容使用 **MIT** 协议
