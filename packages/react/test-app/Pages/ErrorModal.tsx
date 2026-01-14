import { config, router } from '@inertiajs/react'

export default ({ dialog }: { dialog: boolean }) => {
  const invalidVisit = () => {
    router.post('/non-inertia')
  }

  const invalidVisitJson = () => {
    router.post('/json')
  }

  if (dialog) {
    config.set('future.useDialogForErrorModal', true)
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
