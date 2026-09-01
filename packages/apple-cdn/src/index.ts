import type { RuleFile } from '@surge/core'
import { fetchText } from '@surge/core'

const source = 'https://github.com/felixonmars/dnsmasq-china-list'
const url = 'https://raw.githubusercontent.com/felixonmars/dnsmasq-china-list/master/apple.china.conf'
const prefix = 'server=/'
const suffix = '/114.114.114.114'

export function parseAppleCdn(input: string): string[] {
  return input.split('\n')
    .filter(line => line.startsWith(prefix) && line.endsWith(suffix))
    .map(line => line.slice(prefix.length, -suffix.length))
}

export async function buildAppleCdn(fetcher: typeof fetch = fetch): Promise<RuleFile> {
  const domains = parseAppleCdn(await fetchText(url, fetcher))

  return {
    title: 'Apple CDN',
    source,
    relativePath: 'Ruleset/CDN/Apple.list',
    content: domains.map(domain => `DOMAIN-SUFFIX,${domain}\n`).join(''),
  }
}
