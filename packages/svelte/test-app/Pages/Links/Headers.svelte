<script>
  import { inertia } from '@inertiajs/svelte'
</script>

<div>
  <span class="text">This is the links page that demonstrates passing custom headers</span>
  <a href="/dump/get" use:inertia class="default">Standard visit Link</a>

  <a href="/dump/get" use:inertia={{ method: 'get', headers: { foo: 'bar' } }} class="custom">GET Link</a>
  <button
    use:inertia={{ method: 'post', href: '/dump/post', headers: { bar: 'baz', 'X-Requested-With': 'custom' } }}
    class="overridden">POST Link</button
  >
</div>
