import FlashLayout from '@/Layouts/FlashLayout'
import { router } from '@inertiajs/react'

const PageOne = () => {
  return (
    <div>
      <span className="text">Page One</span>
      <button className="submit" onClick={() => router.post('/flash/redirect/submit')}>
        Submit
      </button>
    </div>
  )
}

PageOne.layout = (page: React.ReactNode) => <FlashLayout children={page} />

export default PageOne
