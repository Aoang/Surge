import type { RuleFile } from '@surge/core'
import { fetchText } from '@surge/core'

const cidrUrl = 'https://core.telegram.org/resources/cidr.txt'

const domains = [
  't.me',
  'tx.me',
  'tg.dev',
  'tdesktop.com',
  'telegra.ph',
  'telegram.me',
  'telegram.org',
  'graph.org',
  'legra.ph',
  'telesco.pe',
] as const

const additional = [
  '95.161.64.0/20',
  '149.154.160.0/20',
  '109.239.140.0/24',
  '5.28.192.0/18',
] as const

export function parseTelegramCidrs(input: string): string[] {
  return input.split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0 && !line.startsWith('#'))
}

function renderCidr(cidr: string): string {
  return `${cidr.includes(':') ? 'IP-CIDR6' : 'IP-CIDR'},${cidr},no-resolve`
}

export async function buildTelegram(fetcher: typeof fetch = fetch): Promise<RuleFile> {
  const officialCidrs = parseTelegramCidrs(await fetchText(cidrUrl, fetcher))
  const cidrs = [...new Set([...officialCidrs, ...additional])]

  return {
    title: 'Telegram',
    source: cidrUrl,
    relativePath: 'Ruleset/Telegram/Telegram.list',
    content: [
      ...domains.map(domain => `DOMAIN-SUFFIX,${domain}`),
      ...cidrs.map(renderCidr),
    ].join('\n').concat('\n'),
  }
}
