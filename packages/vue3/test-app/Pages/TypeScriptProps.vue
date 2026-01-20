<script setup lang="ts">
// This component is used for checking the TypeScript implementation; there is no Playwright test depending on it.
import { usePage } from '@inertiajs/vue3'

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

const page = usePage<PageProps>()

const userName = page.props.auth.user?.name
const postTitles = page.props.posts.map((post) => post.title)

// @ts-expect-error - 'email' does not exist on user
const userEmail = page.props.auth.user?.email
// @ts-expect-error - 'users' does not exist on page props
const userNames = page.props.users.map((user) => user.name)

console.log({
  userName,
  postTitles,
  userEmail,
  userNames,
})
</script>

<template>
  {{ $page.props.auth.user?.name }}

  <!-- @vue-expect-error - 'email' does not exist on user -->
  {{ $page.props.auth.user?.email }}
</template>
