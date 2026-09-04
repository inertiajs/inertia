<script lang="ts">
  import { router } from '@inertiajs/svelte'

  const signIn = () => {
    router.post('/layers/login')
  }
</script>

<div id="login-page">Sign in to continue</div>

<button onclick={signIn}>Sign in</button>
