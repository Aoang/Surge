import type { RuleFile } from '@surge/core'
import { fetchText } from '@surge/core'

const source = 'https://misaka.io'
const url = 'https://raw.githubusercontent.com/misakaio/chnroutes2/master/chnroutes.txt'
const ipv6Url = 'https://gaoyifan.github.io/china-operator-ip/china6.txt'

export function parseChinaRoutes(input: string): string[] {
  return input.split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0 && !line.startsWith('#'))
}

export async function buildChinaRoutes(fetcher: typeof fetch = fetch): Promise<RuleFile> {
  const routes = parseChinaRoutes(await fetchText(url, fetcher))

  return {
    title: 'China CIDR',
    source,
    relativePath: 'Ruleset/China/China.list',
    content: routes.map(route => `IP-CIDR,${route}\n`).join(''),
  }
}

export async function buildChinaIpv6Routes(fetcher: typeof fetch = fetch): Promise<RuleFile> {
  const routes = parseChinaRoutes(await fetchText(ipv6Url, fetcher))

  return {
    title: 'China CIDR6',
    source: ipv6Url,
    relativePath: 'Ruleset/China/China6.list',
    content: routes.map(route => `IP-CIDR6,${route}\n`).join(''),
  }
}
