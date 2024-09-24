<script context="module">
  export { default as layout } from '../Components/Layout.svelte'
</script>

<script>
  export let appName
  export let users
</script>

<svelte:head>
  <title>Users - {appName}</title>
</svelte:head>

<h1 class="text-3xl">Users</h1>

<div class="mt-6 w-full max-w-2xl overflow-hidden rounded border shadow-sm">
  <table class="w-full text-left">
    <thead>
      <tr>
        <th class="px-4 py-2">Id</th>
        <th class="px-4 py-2">Name</th>
        <th class="px-4 py-2">Email</th>
      </tr>
    </thead>
    <tbody>
      {#each users as user}
        <tr class="border-t">
          <td class="px-4 py-2">{user.id}</td>
          <td class="px-4 py-2">{user.name}</td>
          <td class="px-4 py-2">{user.email}</td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>
