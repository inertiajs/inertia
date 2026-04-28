import { Link } from '@inertiajs/react'

const WithSiblingRenderFunction = () => (
  <div>
    <span id="text">DefaultLayout/WithSiblingRenderFunction</span>
    <Link href="/default-layout">Back to Index</Link>
  </div>
)

WithSiblingRenderFunction.layout = (page: React.ReactNode) => (
  <div id="render-layout">
    <span id="layout-sibling">Sibling</span>
    {page}
  </div>
)

export default WithSiblingRenderFunction
