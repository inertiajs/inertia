import FlashLayout from '@/Layouts/FlashLayout'
import { usePage } from '@inertiajs/react'

const PageTwo = () => {
  const page = usePage()

  return (
    <div>
      <span className="text">Page Two</span>
      <span className="flash">{JSON.stringify(page.flash)}</span>
    </div>
  )
}

PageTwo.layout = (page: React.ReactNode) => <FlashLayout children={page} />

export default PageTwo
