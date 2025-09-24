<script lang="ts">
  // This component is used for checking the TypeScript implementation; there is no Playwright test depending on it.
  import { useForm } from '@inertiajs/svelte5'

  interface LoginData {
    username: string
    password: string
    remember: boolean
  }

  const { user = null }: {
    user?: {
      username?: string | null;
    } | null;
  } = $props()

  useForm<LoginData>({
    username: user?.username ?? '',
    password: '',
    remember: true,
  })
</script>
