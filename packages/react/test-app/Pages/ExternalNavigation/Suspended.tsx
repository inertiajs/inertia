import { use } from 'react'
import Report from './Report'

let ready: Promise<unknown> | undefined

export default function Suspended(props: Parameters<typeof Report>[0] & { fail?: boolean }) {
  if (props.fail) {
    throw new Error('Report rendering failed')
  }

  ready ??= fetch('/external-navigation/ready').then((response) => response.json())
  use(ready)

  return <Report {...props} />
}
