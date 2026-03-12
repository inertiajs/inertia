<script lang="ts" context="module">
  declare module '@inertiajs/core' {
    export interface InertiaConfig {
      sharedPageProps: {
        auth: { user: { name: string } | null }
      }
    }
  }
</script>

<script lang="ts">
  // This component is used for checking the TypeScript implementation; there is no Playwright test depending on it.
  import { router, usePage } from '@inertiajs/svelte'

  type PageProps = {
    posts: { id: number; title: string }[]
  }

  const page = usePage<PageProps>()

  $: userName = $page.props.auth.user?.name
  $: postTitles = $page.props.posts.map((post) => post.title)

  // @ts-expect-error - 'email' does not exist on user
  $: userEmail = $page.props.auth.user?.email
  // @ts-expect-error - 'users' does not exist on page props
  $: userNames = $page.props.users.map((user) => user.name)

  router.on('success', (event) => {
    const name = event.detail.page.props.auth.user?.name
    // @ts-expect-error - 'email' does not exist on user
    const email = event.detail.page.props.auth.user?.email
    console.log({ name, email })
  })

  router.on('navigate', (event) => {
    const name = event.detail.page.props.auth.user?.name
    // @ts-expect-error - 'email' does not exist on user
    const email = event.detail.page.props.auth.user?.email
    console.log({ name, email })
  })

  router.on('beforeUpdate', (event) => {
    const name = event.detail.page.props.auth.user?.name
    // @ts-expect-error - 'email' does not exist on user
    const email = event.detail.page.props.auth.user?.email
    console.log({ name, email })
  })

  console.log({
    userName,
    postTitles,
    userEmail,
    userNames,
  })
</script>
