<script>
  import { inertia } from '@inertiajs/svelte'
</script>

<div>
  <span class="text">This is the links page that demonstrates inertia-link methods</span>

  <a href="/dump/get" use:inertia={{ method: 'get' }} class="get">GET Link</a>
  <button use:inertia={{ method: 'post', href: '/dump/post' }} class="post">POST Link</button>
  <button use:inertia={{ method: 'put', href: '/dump/put' }} class="put">PUT Link</button>
  <button use:inertia={{ method: 'patch', href: '/dump/patch' }} class="patch">PATCH Link</button>
  <button use:inertia={{ method: 'delete', href: '/dump/delete' }} class="delete">DELETE Link</button>
</div>
