<script setup lang="ts">
// This component is used for checking the TypeScript implementation; there is no Playwright test depending on it.
import { usePage } from '@inertiajs/vue3'

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
</script>

<template>
  {{ $page.props.flash.error }}

  <!-- @vue-expect-error - 'message' does not exist on flash -->
  {{ $page.props.flash.message }}
</template>
