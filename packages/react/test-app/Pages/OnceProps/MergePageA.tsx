import { Link, router } from '@inertiajs/react'

export default ({ items, bar }: { items: string[]; bar: string }) => {
  return (
    <>
      <p id="items">Items count: {items.length}</p>
      <p id="bar">Bar: {bar}</p>
      <Link href="/once-props/merge/b">Go to Merge Page B</Link>
      <button onClick={() => router.reload({ only: ['items'] })}>Load more items</button>
    </>
  )
}
