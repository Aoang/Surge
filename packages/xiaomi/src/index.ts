import type { RuleFile } from '@surge/core'
import { fetchText } from '@surge/core'

const source = 'https://raw.githubusercontent.com/jerryn70/GoodbyeAds/master/Extension/GoodbyeAds-Xiaomi-Extension.txt'

export function parseXiaomiHosts(input: string): string[] {
  const domains = input.split('\n')
    .map(line => line.replace(/\s*[#!].*$/, '').trim().split(/\s+/))
    .filter(parts => parts.length >= 2 && /^(?:0\.0\.0\.0|127\.0\.0\.1|::)$/.test(parts[0] ?? ''))
    .map(parts => parts[1])
    .filter((hostname): hostname is string => Boolean(hostname && hostname !== 'localhost'))

  return [...new Set(domains)]
}

export async function buildXiaomi(fetcher: typeof fetch = fetch): Promise<RuleFile> {
  const domains = parseXiaomiHosts(await fetchText(source, fetcher))

  return {
    title: 'Xiaomi',
    source,
    relativePath: 'Ruleset/Block/Xiaomi.set',
    content: domains.join('\n'),
  }
}
