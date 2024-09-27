import { router } from '@inertiajs/react'

export default (props) => {
  const locationVisit = (e) => {
    e.preventDefault()
    router.visit('/location')
  }

  return (
    <div>
      <span className="text">This is the page that demonstrates location visits</span>

      <a href="#" onClick={locationVisit} className="example">
        Location visit
      </a>
    </div>
  )
}
