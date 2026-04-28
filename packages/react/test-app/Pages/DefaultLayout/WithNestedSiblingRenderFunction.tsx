import { Link } from '@inertiajs/react'

const WithNestedSiblingRenderFunction = () => (
  <div>
    <span id="text">DefaultLayout/WithNestedSiblingRenderFunction</span>
    <Link href="/default-layout">Back to Index</Link>
  </div>
)

WithNestedSiblingRenderFunction.layout = (page: React.ReactNode) => (
  <div id="outer-layout">
    <div id="inner-layout">
      <span id="layout-sibling">Sibling</span>
      {page}
    </div>
  </div>
)

export default WithNestedSiblingRenderFunction
