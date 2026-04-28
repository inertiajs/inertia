import { Link, renderLayout } from '@inertiajs/react'

const ArrowLayout = ({ children }: { children: React.ReactNode }) => (
  <div id="arrow-layout">
    <span>Arrow Layout</span>
    {children}
  </div>
)

const WithArrowComponentLayout = () => (
  <div>
    <span id="text">DefaultLayout/WithArrowComponentLayout</span>
    <Link href="/default-layout">Back to Index</Link>
  </div>
)

WithArrowComponentLayout.layout = renderLayout((page) => <ArrowLayout>{page}</ArrowLayout>)

export default WithArrowComponentLayout
