import { router } from '@inertiajs/react'

export default (props) => {
  const visit = (e) => {
    e.preventDefault()
    router.get(
      '/sleep',
      {},
      {
        onStart: () => console.log('started'),
        onCancel: () => console.log('cancelled'),
      },
    )
  }

  return (
    <div>
      <span className="text">This is the page that demonstrates that only one visit can be active at a time</span>
      <a href="#" onClick={visit} className="visit">
        Link
      </a>
    </div>
  )
}
