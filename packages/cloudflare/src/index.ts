import type { RuleFile } from '@surge/core'
import { fetchText } from '@surge/core'

const ipv4Url = 'https://www.cloudflare.com/ips-v4'
const ipv6Url = 'https://www.cloudflare.com/ips-v6'

export function parseCloudflareRanges(input: string): string[] {
  return input.split('\n').map(line => line.trim()).filter(Boolean)
}

export async function buildCloudflare(fetcher: typeof fetch = fetch): Promise<RuleFile> {
  const [ipv4Text, ipv6Text] = await Promise.all([
    fetchText(ipv4Url, fetcher),
    fetchText(ipv6Url, fetcher),
  ])
  const ipv4 = [...parseCloudflareRanges(ipv4Text), '1.0.0.1/32', '1.1.1.1/32']
  const ipv6 = parseCloudflareRanges(ipv6Text)

  return {
    title: 'Cloudflare CDN',
    source: 'https://www.cloudflare.com/ips',
    relativePath: 'Ruleset/CDN/Cloudflare.list',
    content: [
      ...ipv4.map(range => `IP-CIDR,${range}\n`),
      ...ipv6.map(range => `IP-CIDR6,${range}\n`),
    ].join(''),
  }
}
