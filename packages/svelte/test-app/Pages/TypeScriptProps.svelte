<script lang="ts" context="module">
  declare module '@inertiajs/core' {
    export interface InertiaConfig {
      sharedPageProps: {
        flash: { success?: string; error?: string }
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

  $: error = $page.props.flash.error
  $: postTitles = $page.props.posts.map((post) => post.title)

  // @ts-expect-error - 'message' does not exist on flash
  $: flashMessage = $page.props.flash.message
  // @ts-expect-error - 'users' does not exist on page props
  $: userNames = $page.props.users.map((user) => user.name)

  console.log({
    error,
    postTitles,
    flashMessage,
    userNames,
  })
</script>
