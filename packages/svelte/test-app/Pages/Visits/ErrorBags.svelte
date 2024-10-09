<script>
  import { router } from '@inertiajs/svelte'

  const defaultVisit = () => {
    router.post('/dump/post')
  }

  const basicVisit = () => {
    router.visit('/dump/post', {
      method: 'post',
      data: { foo: 'bar' },
      errorBag: 'visitErrorBag',
    })
  }

  const postVisit = () => {
    router.post(
      '/dump/post',
      {
        foo: 'baz',
      },
      {
        errorBag: 'postErrorBag',
      },
    )
  }
</script>

<div>
  <span class="text">This is the page that demonstrates error bags using manual visits</span>
  <a href="#" on:click={defaultVisit} class="default">Default visit</a>
  <a href="#" on:click={basicVisit} class="visit">Basic visit</a>
  <a href="#" on:click={postVisit} class="get">POST visit</a>
</div>
