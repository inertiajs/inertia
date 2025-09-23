<script lang="ts">
  import { inertia } from '@inertiajs/svelte5'

  const linkData = {
    file: new File([], 'example.jpg'),
    foo: 'bar',
  }
</script>

<div>
  <span class="text"
    >This is the links page that demonstrates the automatic conversion of plain objects to form-data</span
  >

  <a href="/dump/get" use:inertia={{ method: 'get', data: linkData }} class="get">GET Link</a>
  <button use:inertia={{ method: 'post', href: '/dump/post', data: linkData }} class="post">POST Link</button>
  <button use:inertia={{ method: 'put', href: '/dump/put', data: linkData }} class="put">PUT Link</button>
  <button use:inertia={{ method: 'patch', href: '/dump/patch', data: linkData }} class="patch">PATCH Link</button>
  <button use:inertia={{ method: 'delete', href: '/dump/delete', data: linkData }} class="delete">DELETE Link</button>
</div>
