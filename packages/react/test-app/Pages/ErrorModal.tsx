import { router } from '@inertiajs/react'

export default () => {
  const invalidVisit = () => {
    router.post('/non-inertia')
  }

  const invalidVisitJson = () => {
    router.post('/json')
  }

  return (
    <div>
      <span onClick={invalidVisit} className="invalid-visit">
        Invalid Visit
      </span>
      <span onClick={invalidVisitJson} className="invalid-visit-json">
        Invalid Visit (JSON response)
      </span>
    </div>
  )
}
