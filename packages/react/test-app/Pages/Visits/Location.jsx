import { router } from '@inertiajs/react'

export default (props) => {
  const locationVisit = () => {
    router.visit('/location')
  }

  return (
    <div>
      <span className="text">This is the page that demonstrates location visits</span>

      <span onClick={locationVisit} className="example">
        Location visit
      </span>
    </div>
  )
}
