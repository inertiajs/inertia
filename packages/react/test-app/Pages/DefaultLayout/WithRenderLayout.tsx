import { Link, renderLayout } from '@inertiajs/react'
import PageLayout from '@/Layouts/PageLayout'

const WithRenderLayout = () => (
  <div>
    <span id="text">DefaultLayout/WithRenderLayout</span>
    <Link href="/default-layout">Back to Index</Link>
  </div>
)

WithRenderLayout.layout = renderLayout((page) => <PageLayout>{page}</PageLayout>)

export default WithRenderLayout
