import { router } from '@inertiajs/react'

export default function Wayfinder() {
  const wayfinderObjectVisit = (e: React.MouseEvent) => {
    e.preventDefault()
    router.visit({ url: '/dump/post', method: 'post' })
  }

  const wayfinderObjectMethodOverride = (e: React.MouseEvent) => {
    e.preventDefault()
    router.visit({ url: '/dump/patch', method: 'get' }, { method: 'patch' })
  }

  return (
    <div>
      <a href="#" onClick={wayfinderObjectVisit} className="wayfinder-visit">
        Wayfinder object visit
      </a>
      <a href="#" onClick={wayfinderObjectMethodOverride} className="wayfinder-method-override">
        Wayfinder object method override
      </a>
    </div>
  )
}
