<script lang="ts">
  import { inertia, Link, router, usePage } from '@inertiajs/svelte'

  const page = usePage()

  const visitWithFragment = (e: MouseEvent) => {
    e.preventDefault()
    router.visit('/preserve-fragment/redirect#my-fragment')
  }

  const getWithPreserveFragment = (e: MouseEvent) => {
    e.preventDefault()
    router.get('/preserve-fragment', { status: 'open' }, { preserveFragment: true })
  }

  const getWithoutPreserveFragment = (e: MouseEvent) => {
    e.preventDefault()
    router.get('/preserve-fragment', { status: 'open' })
  }

  const redirectWithPreserveFragment = (e: MouseEvent) => {
    e.preventDefault()
    router.visit('/preserve-fragment/redirect-no-server-flag', { preserveFragment: true })
  }
</script>

<div>
  <span id="current-url">{page.url}</span>

  <a href="/preserve-fragment/redirect#my-fragment" use:inertia id="link-with-fragment">Link with fragment</a>

  <a href={'#'} onclick={visitWithFragment} id="manual-visit-with-fragment">Manual visit with fragment</a>

  <Link href="/preserve-fragment?status=open" preserveFragment id="link-preserve-fragment">Link preserve fragment</Link>

  <a href={'#'} onclick={getWithPreserveFragment} id="visit-preserve-fragment">Visit preserve fragment</a>

  <a href={'#'} onclick={getWithoutPreserveFragment} id="visit-without-preserve-fragment">
    Visit without preserve fragment
  </a>

  <a href={'#'} onclick={redirectWithPreserveFragment} id="redirect-preserve-fragment">Redirect preserve fragment</a>
</div>
