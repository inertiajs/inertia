import { Link, renderLayout } from '@inertiajs/react'

const WithRenderLayoutPageProps = ({ title }: { title: string }) => (
  <div>
    <span id="text">DefaultLayout/WithRenderLayoutPageProps</span>
    <Link href="/default-layout">Back to Index</Link>
  </div>
)

WithRenderLayoutPageProps.layout = renderLayout((page: React.ReactElement<{ title: string }>) => (
  <div id="props-layout" data-title={page.props.title}>
    <span id="layout-title">{page.props.title}</span>
    {page}
  </div>
))

export default WithRenderLayoutPageProps
