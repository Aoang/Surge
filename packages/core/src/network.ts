export async function fetchText(
  url: string,
  fetcher: typeof fetch = fetch,
  options: FetchTextOptions = {},
): Promise<string> {
  const attempts = options.attempts ?? 3
  const retryDelayMs = options.retryDelayMs ?? 1_000
  const timeoutMs = options.timeoutMs ?? 30_000

  if (!Number.isInteger(attempts) || attempts < 1)
    throw new RangeError('Fetch attempts must be a positive integer')

  let lastError: unknown

  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      const response = await fetcher(url, {
        signal: AbortSignal.timeout(timeoutMs),
      })

      if (!response.ok)
        throw new Error(`Failed to fetch ${url}, status: ${response.status}`)

      return await response.text()
    }
    catch (error) {
      lastError = error

      if (attempt < attempts)
        await new Promise(resolve => setTimeout(resolve, retryDelayMs * attempt))
    }
  }

  throw new Error(`Failed to fetch ${url} after ${attempts} attempts`, {
    cause: lastError,
  })
}

export interface FetchTextOptions {
  readonly attempts?: number
  readonly retryDelayMs?: number
  readonly timeoutMs?: number
}
