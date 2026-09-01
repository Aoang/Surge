import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

export interface RuleFile {
  readonly title: string
  readonly source: string
  readonly relativePath: string
  readonly content: string
}

export type RuleBuilder = (fetcher?: typeof fetch) => Promise<RuleFile>

export function formatUpdatedAt(updatedAt: Date): string {
  const parts = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(updatedAt)

  return `${parts} +08`
}

export function renderRuleFile(rule: RuleFile, updatedAt = new Date()): string {
  return `# ${rule.title}, ${rule.source}\n# Update: ${formatUpdatedAt(updatedAt)}\n${rule.content}`
}

export async function writeRuleFile(
  outputDirectory: string,
  rule: RuleFile,
  updatedAt = new Date(),
): Promise<void> {
  const destination = path.join(outputDirectory, rule.relativePath)
  await mkdir(path.dirname(destination), { recursive: true })
  await writeFile(destination, renderRuleFile(rule, updatedAt))
}
