// This component is used for checking the TypeScript implementation; there is no Playwright test depending on it.
import { usePage } from '@inertiajs/react'

declare module '@inertiajs/core' {
  export interface InertiaConfig {
    sharedPageProps: {
      flash: { success?: string; error?: string }
    }
  }
}

type PageProps = {
  posts: { id: number; title: string }[]
}

export default function TypeScriptProps() {
  const page = usePage<PageProps>()

  const error = page.props.flash.error
  const postTitles = page.props.posts.map((post) => post.title)

  // @ts-expect-error - 'message' does not exist on flash
  const flashMessage = page.props.flash.message
  // @ts-expect-error - 'users' does not exist on page props
  const userNames = page.props.users.map((user) => user.name)

  console.log({
    error,
    postTitles,
    flashMessage,
    userNames,
  })

  return null
}
