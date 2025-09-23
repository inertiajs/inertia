<script lang="ts">
  import { onMount } from 'svelte'
  import { inertia } from '@inertiajs/svelte5'

  let linkData = new FormData()

  onMount(() => {
    linkData.append('bar', 'baz')
  })
</script>

<div>
  <span class="text">This is the links page that demonstrates passing data through FormData objects</span>

  <a href="/dump/get" use:inertia={{ method: 'get', data: linkData }} class="get">GET Link</a>
  <button use:inertia={{ method: 'post', href: '/dump/post', data: linkData }} class="post">POST Link</button>
  <button use:inertia={{ method: 'put', href: '/dump/put', data: linkData }} class="put">PUT Link</button>
  <button use:inertia={{ method: 'patch', href: '/dump/patch', data: linkData }} class="patch">PATCH Link</button>
  <button use:inertia={{ method: 'delete', href: '/dump/delete', data: linkData }} class="delete">DELETE Link</button>
</div>
