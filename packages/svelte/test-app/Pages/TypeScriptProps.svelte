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
  import { usePage } from '@inertiajs/svelte'

  type PageProps = {
    posts: { id: number; title: string }[]
  }

  const page = usePage<PageProps>()

  let error = $derived(page.props.flash.error)
  let postTitles = $derived(page.props.posts.map((post) => post.title))

  // @ts-expect-error - 'message' does not exist on flash
  let flashMessage = $derived(page.props.flash.message)
  // @ts-expect-error - 'users' does not exist on page props
  let userNames = $derived(page.props.users.map((user) => user.name))

  $effect.pre(() => {
    console.log({
      error,
      postTitles,
      flashMessage,
      userNames,
    })
  })
</script>
