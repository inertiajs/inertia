<script>
  import { inertia } from '@inertiajs/svelte'
</script>

<div>
  <span class="text">This is the links page that demonstrates passing data through plain objects</span>

  <a href="/dump/get" use:inertia={{ method: 'GET', data: { foo: 'get' } }} class="get">GET Link</a>
  <button use:inertia={{ method: 'POST', href: '/dump/post', data: { bar: 'post' } }} class="post">POST Link</button>
  <button use:inertia={{ method: 'PUT', href: '/dump/put', data: { baz: 'put' } }} class="put">PUT Link</button>
  <button use:inertia={{ method: 'PATCH', href: '/dump/patch', data: { foo: 'patch' } }} class="patch"
    >PATCH Link</button
  >
  <button use:inertia={{ method: 'DELETE', href: '/dump/delete', data: { bar: 'delete' } }} class="delete"
    >DELETE Link</button
  >

  <a href="/dump/get" use:inertia={{ data: { a: ['b', 'c'] } }} class="qsaf-default">QSAF Defaults</a>
  <a href="/dump/get" use:inertia={{ data: { a: ['b', 'c'] }, queryStringArrayFormat: 'indices' }} class="qsaf-indices"
    >QSAF Indices</a
  >
  <a
    href="/dump/get"
    use:inertia={{ data: { a: ['b', 'c'] }, queryStringArrayFormat: 'brackets' }}
    class="qsaf-brackets">QSAF Brackets</a
  >
</div>
