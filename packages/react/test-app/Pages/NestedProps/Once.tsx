import { router, usePage } from '@inertiajs/react'

export default () => {
  const { config } = usePage<{
    config: {
      locale?: string
      timezone: string
    }
  }>().props

  return (
    <>
      <p id="locale">Locale: {config.locale}</p>
      <p id="timezone">Timezone: {config.timezone}</p>
      <button onClick={() => router.reload()}>Reload</button>
      <button onClick={() => router.reload({ only: ['config'] })}>Reload only config</button>
    </>
  )
}
