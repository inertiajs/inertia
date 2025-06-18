import { router } from '@inertiajs/react'
import { useEffect } from 'react'

export default (props) => {
  useEffect(() => {
    router.reload({ only: ['name'] })
  })

  return <div>Name is {props.name}</div>
}
