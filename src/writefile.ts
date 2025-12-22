interface Props {
  title: string;
  source: string;
  content: string;
  path: string;
}

export default async function writeFile(
  { title, source, content, path }: Props,
) {
  const file = await Deno.open(`${Deno.cwd()}/_site${path}`, {
    write: true,
    truncate: true,
  });

  await file.write(
    new TextEncoder().encode(
      `# ${title}, ${source}\n# Update: ${new Date().toString()}\n${content}`,
    ),
  );

  file.close();
}
