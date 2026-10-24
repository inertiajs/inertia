export function createHost<Page>(mount: (page: Page) => Promise<{ dispose: () => void | Promise<void> }>) {
  let dispose: (() => void | Promise<void>) | undefined
  let mountGeneration = 0
  const content = document.getElementById('app')!
  const status = document.getElementById('host-status')!

  const leave = async () => {
    mountGeneration++
    await dispose?.()

    dispose = undefined
    content.replaceChildren()
    status.textContent = 'No report open'
    document.title = 'Reports host'
  }

  const open = async (url: string, push = true) => {
    await leave()

    const currentMountGeneration = mountGeneration
    const response = await fetch(url, { headers: { 'X-Inertia': 'true' } })
    const page = await response.json()

    if (currentMountGeneration !== mountGeneration) {
      return
    }

    if (push) {
      history.pushState({ host: true }, '', url)
    }

    const app = await mount(page)

    if (currentMountGeneration !== mountGeneration) {
      await app.dispose()

      return
    }

    dispose = app.dispose
    status.textContent = 'Report open'
  }

  const navigate = (url: string) => {
    document.body.dataset.navigationOrder = `${document.body.dataset.navigationOrder || ''}navigate,`
    const destination = new URL(url, location.href)

    if (!destination.pathname.startsWith('/external-navigation/')) {
      location.assign(destination)

      return
    }

    void open(destination.href)
  }

  document.getElementById('open-first')!.onclick = () => navigate('/external-navigation/1')
  document.getElementById('open-second')!.onclick = () => navigate('/external-navigation/2')
  document.getElementById('leave')!.onclick = () => void leave()
  window.addEventListener('popstate', () => void open(location.href, false))
  history.replaceState({ host: true }, '')

  return {
    navigate,
    remember: (data: unknown, key: string) =>
      sessionStorage.setItem(`${location.pathname}:${key}`, JSON.stringify(data)),
    restore: (key: string) => JSON.parse(sessionStorage.getItem(`${location.pathname}:${key}`) || 'null') ?? undefined,
    start: (page: Page) =>
      mount(page).then((app) => {
        dispose = app.dispose
        status.textContent = 'Report open'
      }),
  }
}
