<script>
  import { router } from '@inertiajs/svelte'

  const visitDump = (e) => {
    e.preventDefault()
    router.visit('/dump/get')
  }

  const throwErrorOnSuccess = (e) => {
    e.preventDefault()

    router.visit('/visits/after-error/2', {
      onSuccess: () => {
        throw new Error('Error after visit')
      }
    })
  }
</script>

<div>
  <a href="#" on:click={visitDump}>
    Visit dump page
  </a>

  <a href="#" on:click={throwErrorOnSuccess}>
    Throw error on success
  </a>
</div>