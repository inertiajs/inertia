<script lang="ts">
  // This component is used for checking the TypeScript implementation; there is no Playwright test depending on it.
  import { useForm } from '@inertiajs/svelte'

  interface LoginData {
    username: string
    password: string
    remember: boolean
  }

  export let user: {
    username?: string | null
  } | null = null

  useForm<LoginData>({
    username: user?.username ?? '',
    password: '',
    remember: true,
  })
</script>