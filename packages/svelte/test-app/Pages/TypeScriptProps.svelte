<script lang="ts" module>
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

  let userName = $derived(page.props.auth.user?.name)
  let postTitles = $derived(page.props.posts.map((post) => post.title))

  // @ts-expect-error - 'email' does not exist on user
  let userEmail = $derived(page.props.auth.user?.email)
  // @ts-expect-error - 'users' does not exist on page props
  let userNames = $derived(page.props.users.map((user) => user.name))

  // Global event callbacks should include shared props
  router.on('success', (event) => {
    console.log(event.detail.page.props.auth.user?.name)
    // @ts-expect-error - 'email' does not exist on user
    console.log(event.detail.page.props.auth.user?.email)
  })

  router.on('navigate', (event) => {
    console.log(event.detail.page.props.auth.user?.name)
    // @ts-expect-error - 'email' does not exist on user
    console.log(event.detail.page.props.auth.user?.email)
  })

  router.on('beforeUpdate', (event) => {
    console.log(event.detail.page.props.auth.user?.name)
    // @ts-expect-error - 'email' does not exist on user
    console.log(event.detail.page.props.auth.user?.email)
  })

  // Visit callback onSuccess should include shared props
  router.visit('/example', {
    onSuccess: (page) => {
      console.log(page.props.auth.user?.name)
      // @ts-expect-error - 'email' does not exist on user
      console.log(page.props.auth.user?.email)
    },
  })

  // Client-side visit onSuccess should include shared props
  router.push({
    onSuccess: (page) => {
      console.log(page.props.auth.user?.name)
      // @ts-expect-error - 'email' does not exist on user
      console.log(page.props.auth.user?.email)
    },
  })

  router.replace({
    onSuccess: (page) => {
      console.log(page.props.auth.user?.name)
      // @ts-expect-error - 'email' does not exist on user
      console.log(page.props.auth.user?.email)
    },
  })

  $effect.pre(() => {
    console.log({
      userName,
      postTitles,
      userEmail,
      userNames,
    })
  })
</script>
