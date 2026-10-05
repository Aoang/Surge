import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { blockers, createConfig, generateConfig, parseNodes, services, validateConfig } from './config.ts'

function subscribed() {
  return { ...createConfig(), subscription: 'https://example.com/surge?token=fixture' }
}

test('all presets generate macOS and iOS profiles with a terminal FINAL rule', () => {
  for (const preset of ['balanced', 'proxy', 'direct'] as const) {
    for (const platform of ['mac', 'ios'] as const) {
      const config = { ...createConfig(preset), platform, subscription: 'https://example.com/surge' }
      const output = generateConfig(config)
      assert.match(output, /\[General\][\s\S]*\[Proxy\][\s\S]*\[Proxy Group\][\s\S]*\[Rule\]/)
      assert.match(output.trim(), new RegExp(`FINAL,${preset === 'direct' ? 'DIRECT' : 'Proxy'},dns-failed$`))
      assert.equal(output.includes('Ruleset/Process/Process.list'), platform === 'mac')
      assert.equal(output.includes('GEOIP,CN,DIRECT'), preset !== 'proxy')
      assert.doesNotMatch(output, /Cloudflare\.list|Parallels\.list|\[MITM\]|\[Module\]/)
    }
  }
})

test('custom overrides precede blocking and services precede domestic IP rules', () => {
  const config = subscribed()
  config.customRules = [{ id: 1, type: 'DOMAIN-SUFFIX', value: 'allowed.example.com', policy: 'DIRECT' }]
  const output = generateConfig(config)
  const positions = ['DOMAIN-SUFFIX,allowed.example.com,DIRECT', 'RULE-SET,LAN,DIRECT', 'Block/Base.set,REJECT', 'Process/Process.list,DIRECT', 'CDN/Apple.list,DIRECT', 'Apple/Apple.list,DIRECT', 'Telegram/Telegram.list,Telegram', 'China/China.list,DIRECT', 'FINAL,Proxy'].map(value => output.indexOf(value))
  assert.ok(positions.every(position => position >= 0))
  assert.deepEqual(positions, [...positions].sort((a, b) => a - b))
  assert.doesNotMatch(output, /China\.list,DIRECT,no-resolve/)
})

test('catalog matches actual rule and domain set formats, rather than filename extensions', () => {
  for (const entry of [...services, ...blockers]) {
    const file = new URL(`../../../output/Ruleset/${entry.path}`, import.meta.url)
    if (['apple', 'onedrive', 'teams', 'paypal', 'parallels'].includes(entry.id)) {
      const content = readFileSync(file, 'utf8')
      assert.equal(entry.type, 'RULE-SET')
      assert.match(content, /^(?:DOMAIN|PROCESS-NAME)/m)
    }
  }
  assert.equal(services.find(service => service.id === 'cloudflare')?.type, 'RULE-SET')
  assert.equal(services.find(service => service.id === 'download')?.type, 'DOMAIN-SET')
  assert.equal(blockers.find(blocker => blocker.id === 'base')?.type, 'DOMAIN-SET')
})

test('generated rule URLs agree with builder output paths, including Xiaomi domain set', () => {
  const owners: Record<string, string> = { appleCdn: 'apple-cdn', telegram: 'telegram', download: 'download', cloudflare: 'cloudflare', base: 'base-set', bogus: 'bogus', xiaomi: 'xiaomi' }
  for (const entry of [...services, ...blockers]) {
    const owner = owners[entry.id]
    if (owner) {
      const source = readFileSync(new URL(`../../../packages/${owner}/src/index.ts`, import.meta.url), 'utf8')
      assert.ok(source.includes(`relativePath: 'Ruleset/${entry.path}'`), entry.id)
    }
  }
  const config = createConfig('direct')
  config.blocks.push('xiaomi')
  assert.match(generateConfig(config), /DOMAIN-SET,https:\/\/surge.x2ox.com\/Ruleset\/Block\/Xiaomi.set,REJECT/)
})

test('subscription-backed service groups reuse imported nodes for independent selection', () => {
  const output = generateConfig(subscribed())
  assert.match(output, /Proxy = select, policy-path=https:\/\/example.com\/surge\?token=fixture, update-interval=86400/)
  assert.match(output, /PayPal = select, Proxy, DIRECT, include-other-group=Proxy/)
  assert.match(output, /Telegram = select, Proxy, DIRECT, include-other-group=Proxy/)
})

test('manual nodes preserve protocol parameters and may be selected as custom policies', () => {
  const config = subscribed()
  config.source = 'nodes'
  config.nodes = '# my nodes\n香港 = trojan, hk.example.com, 443, password=secret=123\n日本 = snell, jp.example.com, 443, psk=secret, version=4'
  config.selection = 'url-test'
  config.servicePolicies.paypal = '香港'
  const output = generateConfig(config)
  assert.match(output, /香港 = trojan, hk.example.com, 443, password=secret=123/)
  assert.match(output, /Proxy = url-test, include-all-proxies=true, url=http:\/\/www.gstatic.com\/generate_204, interval=600, tolerance=50/)
  assert.match(output, /PayPal\/PayPal.list,香港/)
  assert.doesNotMatch(output, /policy-path=/)
})

test('direct preset exports without supplying a proxy and disabled rules are omitted', () => {
  const config = createConfig('direct')
  config.servicePolicies.apple = 'OFF'
  config.blocks = []
  const output = generateConfig(config)
  assert.doesNotMatch(output, /policy-path=|Proxy =|Block\/|Apple\/Apple.list/)
  assert.match(output, /FINAL,DIRECT,dns-failed/)
})

test('invalid subscription URLs cannot inject profile directives', () => {
  for (const subscription of ['', 'http://example.com', 'https://example.com\n[Rule]', 'https://example.com/,include-all-proxies=true', 'https://user:pass@example.com', 'https://example.com/#comment']) {
    const config = { ...createConfig(), subscription }
    assert.ok(validateConfig(config).length > 0)
    assert.throws(() => generateConfig(config))
  }
})

test('manual node parser rejects duplicate/reserved names, whole profiles and malformed nodes', () => {
  for (const nodes of ['[Proxy]\nHK = trojan, example.com, 443', 'HK = trojan, 999.1.1.1, 443', 'HK = trojan, example.com, 65536', 'HK = trojan, example.com, 0', 'Proxy = trojan, example.com, 443', 'PayPal = trojan, example.com, 443', 'HK = wireguard, example.com, 443', 'trojan://secret@example.com:443', 'HK = trojan, example.com, 443\nHK = snell, example.com, 443'])
    assert.ok(parseNodes(nodes).errors.length > 0, nodes)
  assert.deepEqual(parseNodes('HK = socks5, 127.0.0.1, 1080').names, ['HK'])
  assert.deepEqual(parseNodes('IPv6 = trojan, 2001:db8::1, 443, password=secret').names, ['IPv6'])
})

test('removing a referenced node blocks export rather than leaving an undefined policy', () => {
  const config = createConfig('direct')
  config.source = 'nodes'
  config.nodes = 'HK = socks5, 127.0.0.1, 1080'
  config.finalPolicy = 'HK'
  assert.deepEqual(validateConfig(config), [])
  config.nodes = ''
  assert.throws(() => generateConfig(config), /不存在的节点/)
})

test('DNS and custom rules reject invalid addresses and section injection', () => {
  const config = subscribed()
  for (const dns of ['', '999.1.1.1', 'system\n[Rule]', 'dns.example.com', '1.1.1.1,'])
    assert.ok(validateConfig({ ...config, dns }).length > 0, dns)
  for (const [type, value] of [['DOMAIN-SUFFIX', 'https://example.com'], ['DOMAIN', 'example.com\n[Rule]'], ['IP-CIDR', '192.168.1.0/33'], ['IP-CIDR6', '2001:db8::/129'], ['IP-CIDR', '999.1.1.1/24'], ['DOMAIN-KEYWORD', 'example,Proxy']] as const)
    assert.ok(validateConfig({ ...config, customRules: [{ id: 1, type, value, policy: 'DIRECT' }] }).length > 0, value)
})

test('IPv6 settings and CIDRs are supported, PROCESS-NAME is macOS only', () => {
  const config = createConfig('direct')
  config.dns = 'system, 2001:4860:4860::8888'
  config.ipv6 = false
  config.servicePolicies.cloudflare = 'Proxy'
  config.subscription = 'https://example.com/surge'
  config.customRules = [{ id: 1, type: 'IP-CIDR6', value: '2001:db8::/32', policy: 'DIRECT' }]
  const output = generateConfig(config)
  assert.match(output, /ipv6 = false\nipv6-vif = off/)
  assert.match(output, /IP-CIDR6,2001:db8::\/32,DIRECT,no-resolve/)
  assert.match(output, /Cloudflare.list,Cloudflare 网段,no-resolve/)
  config.customRules = [{ id: 1, type: 'PROCESS-NAME', value: 'curl', policy: 'DIRECT' }]
  config.platform = 'ios'
  assert.throws(() => generateConfig(config), /仅支持 macOS/)
})
