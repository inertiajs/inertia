import { readFile, writeFile } from 'node:fs/promises'

for (const file of ['dist/index.html', 'dist/index-unified.html']) {
  const html = await readFile(new URL(`../${file}`, import.meta.url), 'utf8')
  await writeFile(
    new URL(`../${file}`, import.meta.url),
    html
      .replaceAll('{{ headattribute }}', '{{ headAttribute }}')
      .replaceAll("'{{ httpClient }}'", JSON.stringify(process.env.VITE_HTTP_CLIENT ?? 'default')),
  )
}
