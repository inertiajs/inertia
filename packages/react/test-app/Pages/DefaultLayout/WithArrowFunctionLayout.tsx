import PageLayout from '@/Layouts/PageLayout'
import { Link } from '@inertiajs/react'

const WithArrowFunctionLayout = () => {
  return (
    <div>
      <span id="text">DefaultLayout/WithArrowFunctionLayout</span>
      <Link href="/default-layout">Back to Index</Link>
    </div>
  )
}

WithArrowFunctionLayout.layout = PageLayout

export default WithArrowFunctionLayout
