export type Platform = 'mac' | 'ios'
export type Preset = 'balanced' | 'proxy' | 'direct'
export type Policy = string

export const services = [
  { id: 'appleCdn', name: 'Apple 下载', description: '系统更新、App Store 下载，优先于 Apple 服务规则。', path: 'CDN/Apple.list', type: 'RULE-SET' },
  { id: 'apple', name: 'Apple 服务', description: 'iCloud、App Store 等 Apple 服务。', path: 'Apple/Apple.list', type: 'RULE-SET' },
  { id: 'telegram', name: 'Telegram', description: '域名与官方 IP 网段。', path: 'Telegram/Telegram.list', type: 'RULE-SET' },
  { id: 'paypal', name: 'PayPal', description: '建议在 Surge 中选择固定节点，避免频繁切换出口。', path: 'PayPal/PayPal.list', type: 'RULE-SET' },
  { id: 'onedrive', name: 'OneDrive', description: '域名与 macOS 进程规则。', path: 'Microsoft/OneDrive.list', type: 'RULE-SET' },
  { id: 'teams', name: 'Microsoft Teams', description: '会议与协作服务。', path: 'Microsoft/Teams.list', type: 'RULE-SET' },
  { id: 'download', name: '软件下载', description: 'Homebrew、npm、Docker 等下载域名。', path: 'Test/Download.list', type: 'DOMAIN-SET' },
  { id: 'cloudflare', name: 'Cloudflare 网段', description: '覆盖大量无关网站，默认关闭；仅匹配已解析的 IP。', path: 'CDN/Cloudflare.list', type: 'RULE-SET' },
] as const

export const blockers = [
  { id: 'base', name: '基础广告拦截', description: 'AdGuard / EasyList 域名拦截，不依赖 MITM。', path: 'Block/Base.set', type: 'DOMAIN-SET' },
  { id: 'bogus', name: '无效响应 IP', description: '拦截已知 DNS 污染返回的 IP；不主动触发域名解析。', path: 'Block/Bogus.list', type: 'RULE-SET' },
  { id: 'xiaomi', name: '小米广告', description: '按需启用，可能影响部分小米服务。', path: 'Block/Xiaomi.set', type: 'DOMAIN-SET' },
  { id: 'parallels', name: 'Parallels', description: '会阻断相关服务，默认关闭。', path: 'Block/Parallels.list', type: 'RULE-SET' },
] as const

export const ruleTypes = ['DOMAIN', 'DOMAIN-SUFFIX', 'DOMAIN-KEYWORD', 'IP-CIDR', 'IP-CIDR6', 'PROCESS-NAME'] as const
export type RuleType = typeof ruleTypes[number]
export interface CustomRule { id: number, type: RuleType, value: string, policy: Policy }
export interface Config {
  platform: Platform
  preset: Preset
  source: 'subscription' | 'nodes'
  subscription: string
  nodes: string
  selection: 'select' | 'url-test'
  dns: string
  ipv6: boolean
  chinaDirect: boolean
  processDirect: boolean
  finalPolicy: Policy
  servicePolicies: Record<string, Policy>
  blocks: string[]
  customRules: CustomRule[]
}

export function createConfig(preset: Preset = 'balanced'): Config {
  return {
    platform: 'mac',
    preset,
    source: 'subscription',
    subscription: '',
    nodes: '',
    selection: 'select',
    dns: 'system, 223.5.5.5, 119.29.29.29',
    ipv6: true,
    chinaDirect: preset !== 'proxy',
    processDirect: true,
    finalPolicy: preset === 'direct' ? 'DIRECT' : 'Proxy',
    servicePolicies: Object.fromEntries(services.map(service => [service.id, service.id === 'cloudflare'
      ? 'OFF'
      : preset === 'direct'
        ? 'DIRECT'
        : preset === 'proxy'
          ? 'Proxy'
          : ['telegram', 'paypal', 'onedrive', 'download'].includes(service.id) ? 'Proxy' : 'DIRECT'])),
    blocks: ['base', 'bogus'],
    customRules: [],
  }
}

function isIP(value: string, ipv6: boolean): boolean {
  if (!ipv6) {
    const parts = value.split('.')
    return parts.length === 4 && parts.every(part => /^(?:0|[1-9]\d{0,2})$/.test(part) && Number(part) <= 255)
  }
  if (!/^[\da-f:]+$/i.test(value) || !value.includes(':'))
    return false
  try { return new URL(`http://[${value}]/`).hostname.length > 0 }
  catch { return false }
}

function validDomain(value: string): boolean {
  return value.length <= 253 && value.split('.').every(part => /^[\da-z](?:[\da-z-]{0,61}[\da-z])?$/i.test(part))
}

const reservedNames = new Set(['DIRECT', 'REJECT', 'REJECT-DROP', 'REJECT-TINYGIF', 'REJECT-NO-DROP', 'Proxy', ...services.map(service => service.name)])
const proxyTypes = new Set(['http', 'https', 'socks5', 'socks5-tls', 'ss', 'vmess', 'trojan', 'snell', 'tuic', 'tuic-v5', 'hysteria2', 'ssh'])

export function parseNodes(input: string): { lines: string[], names: string[], errors: string[] } {
  const lines: string[] = []
  const names: string[] = []
  const errors: string[] = []
  for (const [index, raw] of input.split('\n').entries()) {
    const line = raw.trim()
    if (!line || /^(?:#|;|\/\/)/.test(line))
      continue
    const separator = line.indexOf('=')
    const name = line.slice(0, separator).trim()
    const [type = '', host = '', port = ''] = line.slice(separator + 1).split(',').map(part => part.trim())
    if (separator < 1 || !name || /[=,[\]#;"'\r]/.test(name) || !/^\d{1,5}$/.test(port)) {
      errors.push(`节点第 ${index + 1} 行：请输入「名称 = 类型, 服务器, 端口, 参数」，不要粘贴整个配置或分享链接。`)
      continue
    }
    const validHost = /^[\d.]+$/.test(host) ? isIP(host, false) : validDomain(host) || isIP(host, true)
    if (!proxyTypes.has(type) || Number(port) < 1 || Number(port) > 65535
      || !validHost || reservedNames.has(name) || names.includes(name)) {
      errors.push(`节点第 ${index + 1} 行：类型、地址、端口或名称无效；名称不能重复或使用内置策略、策略组名称。`)
      continue
    }
    lines.push(line)
    names.push(name)
  }
  return { lines, names, errors }
}

function validUrl(value: string): boolean {
  if (/[\s,"'\\]/.test(value))
    return false
  try {
    const url = new URL(value)
    return url.protocol === 'https:' && !!url.hostname && !url.hash && !url.username && !url.password
  }
  catch { return false }
}

export function validateConfig(config: Config): string[] {
  const errors: string[] = []
  const nodes = parseNodes(config.source === 'nodes' ? config.nodes : '')
  errors.push(...nodes.errors)
  const policies = new Set(['DIRECT', 'REJECT', 'Proxy', ...nodes.names])
  const selected = [config.finalPolicy, ...Object.values(config.servicePolicies).filter(policy => policy !== 'OFF'), ...config.customRules.map(rule => rule.policy)]
  const needsProxy = selected.includes('Proxy')
  if (needsProxy && config.source === 'subscription' && !validUrl(config.subscription.trim()))
    errors.push('请填写有效的 HTTPS Surge 订阅地址；Clash YAML、Base64 通用订阅不能直接使用。')
  if (needsProxy && config.source === 'nodes' && nodes.lines.length === 0)
    errors.push('请至少添加一个 Surge 格式的节点。')
  if (selected.some(policy => !policies.has(policy)))
    errors.push('有策略引用了不存在的节点，请重新选择策略。')
  if (!config.dns.trim() || !config.dns.split(',').every(value => value.trim() === 'system' || isIP(value.trim(), value.includes(':'))))
    errors.push('DNS 请填写 system 或有效 IP 地址，多个地址用英文逗号分隔。')
  for (const [index, rule] of config.customRules.entries()) {
    const value = rule.value.trim()
    let valid = false
    if (rule.type === 'DOMAIN' || rule.type === 'DOMAIN-SUFFIX') {
      valid = validDomain(value)
    }
    else if (rule.type === 'DOMAIN-KEYWORD' || rule.type === 'PROCESS-NAME') {
      valid = !!value && !/[\r\n,;#"'=]/.test(value) && !value.includes('//')
    }
    else if (rule.type === 'IP-CIDR' || rule.type === 'IP-CIDR6') {
      const [address = '', prefix = '', extra] = value.split('/')
      valid = extra === undefined && /^\d{1,3}$/.test(prefix) && Number(prefix) <= (rule.type === 'IP-CIDR6' ? 128 : 32) && isIP(address, rule.type === 'IP-CIDR6')
    }
    if (!valid || !ruleTypes.includes(rule.type))
      errors.push(`自定义规则 ${index + 1}：匹配内容无效，请填写域名、关键词、网段或进程名称。`)
    if (rule.type === 'PROCESS-NAME' && config.platform !== 'mac')
      errors.push(`自定义规则 ${index + 1}：PROCESS-NAME 仅支持 macOS。`)
  }
  return errors
}

export function generateConfig(config: Config): string {
  const errors = validateConfig(config)
  if (errors.length)
    throw new Error(errors.join('\n'))
  const nodes = parseNodes(config.source === 'nodes' ? config.nodes : '')
  const needsProxy = [config.finalPolicy, ...Object.values(config.servicePolicies), ...config.customRules.map(rule => rule.policy)].includes('Proxy')
  const lines = [
    '# Surge · 配置工坊',
    `# 平台：${config.platform === 'mac' ? 'macOS' : 'iOS'}`,
    '# 在 Surge 中导入此文件，并使用「规则模式」。',
    '# 官方手册：https://manual.nssurge.com/',
    '',
    '[General]',
    'loglevel = notify',
    `dns-server = ${config.dns.split(',').map(value => value.trim()).join(', ')}`,
    `ipv6 = ${config.ipv6}`,
    `ipv6-vif = ${config.ipv6 ? 'auto' : 'off'}`,
    '',
    '[Proxy]',
    ...nodes.lines,
    '',
    '[Proxy Group]',
  ]
  if (needsProxy) {
    const source = config.source === 'subscription'
      ? `policy-path=${config.subscription.trim()}, update-interval=86400`
      : 'include-all-proxies=true'
    lines.push(`Proxy = ${config.selection}, ${source}${config.selection === 'url-test' ? ', url=http://www.gstatic.com/generate_204, interval=600, tolerance=50' : ''}`)
    for (const service of services) {
      if (config.servicePolicies[service.id] === 'Proxy')
        lines.push(`${service.name} = select, Proxy, DIRECT, include-other-group=Proxy`)
    }
  }
  lines.push('', '[Rule]', '# 自定义规则优先匹配，可用于广告误拦截的直连例外。')
  for (const rule of config.customRules)
    lines.push(`${rule.type},${rule.value.trim()},${rule.policy}${rule.type.startsWith('IP-CIDR') ? ',no-resolve' : ''}`)
  lines.push('', '# 局域网直连', 'RULE-SET,LAN,DIRECT', '', '# 广告与无效域名拦截')
  for (const blocker of blockers) {
    if (config.blocks.includes(blocker.id))
      lines.push(`${blocker.type},https://surge.x2ox.com/Ruleset/${blocker.path},REJECT`)
  }
  lines.push('', '# 下载器与隧道进程（仅 macOS）')
  if (config.platform === 'mac' && config.processDirect)
    lines.push('RULE-SET,https://surge.x2ox.com/Ruleset/Process/Process.list,DIRECT')
  lines.push('', '# 服务分流：较具体的规则在前')
  for (const service of services) {
    const policy = config.servicePolicies[service.id]
    if (policy && policy !== 'OFF')
      lines.push(`${service.type},https://surge.x2ox.com/Ruleset/${service.path},${policy === 'Proxy' ? service.name : policy}${service.id === 'cloudflare' ? ',no-resolve' : ''}`)
  }
  if (config.chinaDirect)
    lines.push('', '# 国内 IP 直连；需要 DNS 解析，以识别尚未匹配的国内域名', 'RULE-SET,https://surge.x2ox.com/Ruleset/China/China.list,DIRECT', 'GEOIP,CN,DIRECT')
  lines.push('', '# 所有未匹配请求的出口；DNS 失败时交由此策略处理', `FINAL,${config.finalPolicy},dns-failed`, '')
  return lines.join('\n')
}
