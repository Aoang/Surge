export async function fetchText(
  url: string,
  fetcher: typeof fetch = fetch,
): Promise<string> {
  const response = await fetcher(url)

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}, status: ${response.status}`)
  }

  return response.text()
}
