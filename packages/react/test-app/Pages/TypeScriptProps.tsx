// This component is used for checking the TypeScript implementation; there is no Playwright test depending on it.
import { router, usePage } from '@inertiajs/react'

declare module '@inertiajs/core' {
  export interface InertiaConfig {
    sharedPageProps: {
      auth: { user: { name: string } | null }
    }
  }
}

type PageProps = {
  posts: { id: number; title: string }[]
}

export default function TypeScriptProps() {
  const page = usePage<PageProps>()

  const userName = page.props.auth.user?.name
  const postTitles = page.props.posts.map((post) => post.title)

  // @ts-expect-error - 'email' does not exist on user
  const userEmail = page.props.auth.user?.email
  // @ts-expect-error - 'users' does not exist on page props
  const userNames = page.props.users.map((user) => user.name)

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

  console.log({
    userName,
    postTitles,
    userEmail,
    userNames,
  })

  return null
}
