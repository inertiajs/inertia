import { Link, renderLayout } from '@inertiajs/react'

const WithRenderLayoutPageProps = ({ title }: { title: string }) => (
  <div>
    <span id="text">DefaultLayout/WithRenderLayoutPageProps</span>
    <Link href="/default-layout">Back to Index</Link>
  </div>
)

WithRenderLayoutPageProps.layout = renderLayout((page) => {
  const { title } = (page as React.ReactElement<{ title: string }>).props

  return (
    <div id="props-layout" data-title={title}>
      <span id="layout-title">{title}</span>
      {page}
    </div>
  )
})

export default WithRenderLayoutPageProps
