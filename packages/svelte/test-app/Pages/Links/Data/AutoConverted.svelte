<script>
  import { inertia } from '@inertiajs/svelte'

  const linkData = {
    file: new File([], 'example.jpg'),
    foo: 'bar',
  }
</script>

<div>
  <span class="text"
    >This is the links page that demonstrates the automatic conversion of plain objects to form-data</span
  >

  <a href="/dump/get" use:inertia={{ method: 'GET', data: linkData }} class="get">GET Link</a>
  <button use:inertia={{ method: 'POST', href: '/dump/post', data: linkData }} class="post">POST Link</button>
  <button use:inertia={{ method: 'PUT', href: '/dump/put', data: linkData }} class="put">PUT Link</button>
  <button use:inertia={{ method: 'PATCH', href: '/dump/patch', data: linkData }} class="patch">PATCH Link</button>
  <button use:inertia={{ method: 'DELETE', href: '/dump/delete', data: linkData }} class="delete">DELETE Link</button>
</div>
