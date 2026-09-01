import type { RuleFile } from '@surge/core'
import { fetchText } from '@surge/core'

const source = 'https://github.com/felixonmars/dnsmasq-china-list'
const url = 'https://raw.githubusercontent.com/felixonmars/dnsmasq-china-list/master/bogus-nxdomain.china.conf'
const prefix = 'bogus-nxdomain='

export function parseBogus(input: string): string[] {
  return input.split('\n')
    .filter(line => line.startsWith(prefix))
    .map(line => line.slice(prefix.length).trim())
    .filter(Boolean)
}

export async function buildBogus(fetcher: typeof fetch = fetch): Promise<RuleFile> {
  const addresses = parseBogus(await fetchText(url, fetcher))

  return {
    title: 'Bogus',
    source,
    relativePath: 'Ruleset/Block/Bogus.list',
    content: addresses.map(address => `IP-CIDR,${address}/32,no-resolve\n`).join(''),
  }
}
