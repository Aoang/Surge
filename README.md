# Surge

继 [神机策略](https://github.com/DivineEngine/Profiles) 后自用规则

## Ruleset 规则集

#### Apple

```ini
# https://surge.x2ox.com/Ruleset/Apple/Apple.list
DOMAIN-SET,https://surge.x2ox.com/Ruleset/Apple/Apple.list,Direct
```

- 手动维护
- 针对 Apple 的规则，方便针对性的调整代理

#### CDN

#### Apple CDN

```ini
# https://surge.x2ox.com/Ruleset/CDN/Apple.list
DOMAIN-SET,https://surge.x2ox.com/Ruleset/CDN/Apple.list,Direct
```

- 手动维护
- 针对 Apple 的规则，方便针对性的调整代理

#### Cloudflare CDN

```ini
# https://surge.x2ox.com/Ruleset/CDN/Cloudflare.list
DOMAIN-SET,https://surge.x2ox.com/Ruleset/CDN/Cloudflare.list,Direct
```

- 手动维护
- 针对 Cloudflare 的规则，方便针对性的调整代理

#### Process

```ini
# https://surge.x2ox.com/Ruleset/Process/Process.list
RULE-SET,https://surge.x2ox.com/Ruleset/Process/Process.list,Direct
```

- 手动维护
- 常见的不需要走代理的 APP 程序，例如 P2P 下载、隧道

#### Telegram

```ini
# https://surge.x2ox.com/Ruleset/Telegram/Telegram.list
RULE-SET,https://surge.x2ox.com/Ruleset/Telegram/Telegram.list,Proxy HK
```

- 手动维护，后续加入自动更新 CIDR
- Telegram 的域名及 IP CIDR，按需分配节点，一般走低延时节点

#### PayPal

```ini
# https://surge.x2ox.com/Ruleset/PayPal/PayPal.list
RULE-SET,https://surge.x2ox.com/Ruleset/PayPal/PayPal.list,Proxy US
```

- 手动维护
- PayPal 的域名，按需分配节点，一般为了避免风控给其分配固定 IP 的代理组

#### China

```ini
# https://surge.x2ox.com/Ruleset/China/China.list
RULE-SET,https://surge.x2ox.com/Ruleset/China/China.list,Direct
```

- 自动维护，数据源自
  [misakaio/chnroutes2](https://github.com/misakaio/chnroutes2)
- 国内 IP CIDR，直接放行
- 一般放在靠后的位置，准确来说是放在拦截规则的后面，避免拦截失效

### Microsoft

#### OneDrive

```ini
# https://surge.x2ox.com/Ruleset/Microsoft/OneDrive.list
DOMAIN-SET,https://surge.x2ox.com/Ruleset/Microsoft/OneDrive.list,Proxy US
```

- 手动维护
- 针对 OneDrive 的规则，方便针对性的调整代理

#### Teams

```ini
# https://surge.x2ox.com/Ruleset/Microsoft/Teams.list
DOMAIN-SET,https://surge.x2ox.com/Ruleset/Microsoft/Teams.list,Direct
```

- 手动维护
- 针对 Teams 的规则，方便针对性的调整代理

### Block

#### Base

```ini
# https://surge.x2ox.com/Ruleset/Block/Base.set
DOMAIN-SET,https://surge.x2ox.com/Ruleset/Block/Base.set,Reject
```

- 自动维护，数据源自 [AdGuard](https://adguard.com),
  [EasyList](https://easylist.to) 的基础数据
- 基础广告、隐私保护规则，一般放在特殊规则后，出口规则前
- 综合性能等各方面的考虑，只处理 host 相关的规则，不能代替插件

#### Bogus

```ini
# https://surge.x2ox.com/Ruleset/Block/Bogus.list
RULE-SET,https://surge.x2ox.com/Ruleset/Block/Bogus.list,Reject
```

- 自动维护，数据源自
  [felixonmars/dnsmasq-china-list](https://github.com/felixonmars/dnsmasq-china-list)

#### Parallels

```ini
# https://surge.x2ox.com/Ruleset/Block/Parallels.list
RULE-SET,https://surge.x2ox.com/Ruleset/Block/Parallels.list,Reject
```

- 手动维护
- 屏蔽 Parallels 相关的网址

#### Xiaomi

```ini
# https://surge.x2ox.com/Ruleset/Block/Xiaomi.list
RULE-SET,https://surge.x2ox.com/Ruleset/Block/Xiaomi.list,Reject
```

- 自动维护，数据源自
  [jerryn70/GoodbyeAds](https://github.com/jerryn70/GoodbyeAds)

#### YouTube

```ini
# https://surge.x2ox.com/Ruleset/Block/YouTube.list
RULE-SET,https://surge.x2ox.com/Ruleset/Block/YouTube.list,Reject
```

- 手动维护
- 不推荐使用，基本上没什么效果

## Modules 模块

#### 排除保留 IP 段

```ini
https://surge.x2ox.com/Modules/exclude_cidr.sgmodule
```

- 排除内网保留 IP 段

#### Google.cn 重定向

```ini
https://surge.x2ox.com/Modules/google_cn.sgmodule
```

- 重定向 google.cn 不可用的服务至 google.com

#### 隐藏 VPN 图标

```ini
https://surge.x2ox.com/Modules/hide_vpn_icon.sgmodule
```

- iOS 可用

#### MitM 开启

```ini
https://surge.x2ox.com/Modules/mitm.sgmodule
```

- 对所有域名进行 MitM，常见不可 MitM 除外
- 不推荐使用，除非明确知道模块的用途

#### 绕过 FakeIP

```ini
https://surge.x2ox.com/Modules/real_ip.sgmodule
```

- 对 FakeIP 不可用的服务开启真实 IP
- 例如 stun 服务需要真实 IP 地址
- 或 Tailscale 的服务也需要 stun

#### 跳过代理

```ini
https://surge.x2ox.com/Modules/skip_proxy.sgmodule
```

- 对内网网段跳过代理

## LICENSE

- `https://surge.x2ox.com/Ruleset/China/China.list` 保持原有协议 `CC BY-SA 2.0`
- `https://surge.x2ox.com/Ruleset/Block/Base.set` 及相关处理代码保持原有协议
  `GPLv3`
- 其余内容使用 `MIT` 协议
