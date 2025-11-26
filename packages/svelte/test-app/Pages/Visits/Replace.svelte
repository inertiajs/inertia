<script lang="ts">
  import { router } from '@inertiajs/svelte'

  const replace = (e: Event) => {
    e.preventDefault()

    router.visit('/dump/get', {
      replace: true,
    })
  }

  const replaceFalse = (e: Event) => {
    e.preventDefault()

    router.visit('/dump/get', {
      replace: false,
    })
  }

  const replaceGet = (e: Event) => {
    e.preventDefault()

    router.get(
      '/dump/get',
      {},
      {
        replace: true,
      },
    )
  }

  const replaceGetFalse = (e: Event) => {
    e.preventDefault()

    router.get(
      '/dump/get',
      {},
      {
        replace: false,
      },
    )
  }
</script>

<div>
  <span class="text">This is the links page that demonstrates manual replace</span>

  <a href={'#'} onclick={replace} class="replace">[State] Replace visit: true</a>
  <a href={'#'} onclick={replaceFalse} class="replace-false">[State] Replace visit: false</a>
  <a href={'#'} onclick={replaceGet} class="replace-get">[State] Replace GET: true</a>
  <a href={'#'} onclick={replaceGetFalse} class="replace-get-false">[State] Replace GET: false</a>
</div>
