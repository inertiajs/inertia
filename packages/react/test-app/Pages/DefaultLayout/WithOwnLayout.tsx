import { Link } from '@inertiajs/react'
import PageLayout from '@/Layouts/PageLayout'

const WithOwnLayout = () => {
  return (
    <div>
      <span id="text">DefaultLayout/WithOwnLayout</span>
      <Link href="/default-layout">Back to Index</Link>
    </div>
  )
}

WithOwnLayout.layout = (page: React.ReactNode) => <PageLayout children={page} />

export default WithOwnLayout
