import { router } from '@inertiajs/react'

export default ({ rows, tags }: { rows: { name: string; stats?: string }[]; tags: string[] }) => {
  return (
    <>
      <p id="rows">{JSON.stringify(rows)}</p>
      <p id="tags">{JSON.stringify(tags)}</p>

      <button onClick={() => router.reload({ only: ['rows', 'rows.0.stats'] })}>Reload rows</button>
      <button onClick={() => router.reload({ only: ['tags.1'] })}>Reload second tag</button>
    </>
  )
}
