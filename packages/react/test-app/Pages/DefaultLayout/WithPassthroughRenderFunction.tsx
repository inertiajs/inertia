import { Link } from '@inertiajs/react'

const WithPassthroughRenderFunction = () => (
  <div>
    <span id="text">DefaultLayout/WithPassthroughRenderFunction</span>
    <Link href="/default-layout">Back to Index</Link>
  </div>
)

WithPassthroughRenderFunction.layout = (page: React.ReactNode) => page

export default WithPassthroughRenderFunction
