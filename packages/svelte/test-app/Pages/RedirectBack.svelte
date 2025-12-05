<script lang="ts">
  import { router } from '@inertiajs/svelte'

  const submitWithRedirectBack = () => {
    router.post('/redirect-back/submit', {}, {
      redirectBack: true,
    })
  }

  const submitWithoutRedirectBack = () => {
    router.post('/redirect-back/submit')
  }
</script>

<div>
  <p >This is the page that demonstrates the redirectBack option</p>

  <button on:click|preventDefault={submitWithRedirectBack} >Submit with redirectBack</button>
  <button on:click|preventDefault={submitWithoutRedirectBack} >Submit without redirectBack</button>
</div>
