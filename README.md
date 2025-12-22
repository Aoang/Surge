# Surge

继 [神机策略](https://github.com/DivineEngine/Profiles) 之后的自用 Surge 规则与模块合集，对常用服务做了拆分和按需维护，方便在配置中灵活组合。

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
DOMAIN-SET,https://surge.x2ox.com/Ruleset/Apple/Apple.list,Direct
```

- **维护方式**: 手动维护  
- **用途**: 针对 Apple 服务的域名规则，方便单独调整直连 / 代理策略

---

### CDN

#### Apple CDN

```ini
# https://surge.x2ox.com/Ruleset/CDN/Apple.list
DOMAIN-SET,https://surge.x2ox.com/Ruleset/CDN/Apple.list,Direct
```

- **维护方式**: 手动维护  
- **用途**: Apple 相关下载 / 更新等 CDN 流量，可按需直连或走特定节点

#### Cloudflare CDN

```ini
# https://surge.x2ox.com/Ruleset/CDN/Cloudflare.list
DOMAIN-SET,https://surge.x2ox.com/Ruleset/CDN/Cloudflare.list,Direct
```

- **维护方式**: 手动维护  
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

- **维护方式**: 手动维护（后续计划加入自动更新 CIDR）  
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

```ini
# https://surge.x2ox.com/Ruleset/China/China.list
RULE-SET,https://surge.x2ox.com/Ruleset/China/China.list,Direct
```

- **维护方式**: 自动维护，数据源自 [misakaio/chnroutes2](https://github.com/misakaio/chnroutes2)  
- **用途**: 国内 IP CIDR 直连  
- **建议顺序**: 通常放在拦截规则之后，以避免拦截规则失效

---

### Microsoft

#### OneDrive

```ini
# https://surge.x2ox.com/Ruleset/Microsoft/OneDrive.list
DOMAIN-SET,https://surge.x2ox.com/Ruleset/Microsoft/OneDrive.list,Proxy US
```

- **维护方式**: 手动维护  
- **用途**: OneDrive 相关域名，方便针对性设置代理策略

#### Teams

```ini
# https://surge.x2ox.com/Ruleset/Microsoft/Teams.list
DOMAIN-SET,https://surge.x2ox.com/Ruleset/Microsoft/Teams.list,Direct
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

- **维护方式**: 自动维护，数据源自 [AdGuard](https://adguard.com) 与 [EasyList](https://easylist.to) 的基础规则  
- **用途**: 基础广告、隐私保护规则，一般放在特殊规则后、出口规则前  
- **说明**: 只处理 host 相关规则，出于性能等考虑，不能完全替代插件

#### Bogus

```ini
# https://surge.x2ox.com/Ruleset/Block/Bogus.list
RULE-SET,https://surge.x2ox.com/Ruleset/Block/Bogus.list,Reject
```

- **维护方式**: 自动维护，数据源自 [felixonmars/dnsmasq-china-list](https://github.com/felixonmars/dnsmasq-china-list)

#### Parallels

```ini
# https://surge.x2ox.com/Ruleset/Block/Parallels.list
RULE-SET,https://surge.x2ox.com/Ruleset/Block/Parallels.list,Reject
```

- **维护方式**: 手动维护  
- **用途**: 屏蔽 Parallels 相关网址

#### Xiaomi

```ini
# https://surge.x2ox.com/Ruleset/Block/Xiaomi.list
RULE-SET,https://surge.x2ox.com/Ruleset/Block/Xiaomi.list,Reject
```

- **维护方式**: 自动维护，数据源自 [jerryn70/GoodbyeAds](https://github.com/jerryn70/GoodbyeAds)

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

- `https://surge.x2ox.com/Ruleset/China/China.list` 保持原有协议 **CC BY-SA 2.0**
- `https://surge.x2ox.com/Ruleset/Block/Base.set` 及相关处理代码保持原有协议 **GPLv3**
- 其余内容使用 **MIT** 协议
