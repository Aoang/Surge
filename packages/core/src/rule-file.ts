import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

export interface RuleFile {
  readonly title: string
  readonly source: string
  readonly relativePath: string
  readonly content: string
}

export function renderRuleFile(rule: RuleFile, updatedAt = new Date()): string {
  return `# ${rule.title}, ${rule.source}\n# Update: ${updatedAt.toString()}\n${rule.content}`
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
