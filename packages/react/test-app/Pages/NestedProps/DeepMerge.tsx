import { router, usePage } from '@inertiajs/react'

export default () => {
  const { data } = usePage<{
    data: {
      items: { id: number; name: string }[]
      label: string
    }
  }>().props

  const loadMore = () => {
    router.reload({
      only: ['data'],
      data: { page: 2 },
    })
  }

  return (
    <>
      <p id="items">{data.items.map((i) => i.name).join(', ')}</p>
      <p id="label">Label: {data.label}</p>
      <button onClick={loadMore}>Load More</button>
    </>
  )
}
