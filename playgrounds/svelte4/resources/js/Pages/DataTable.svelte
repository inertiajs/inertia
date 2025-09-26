<script context="module">
  export { default as layout } from '../Components/Layout.svelte'
</script>

<script>
  import { InfiniteScroll } from '@inertiajs/svelte'
  import Spinner from '../Components/Spinner.svelte'

  export let appName
  export let users
</script>

<svelte:head>
  <title>Data Table - {appName}</title>
</svelte:head>

<InfiniteScroll data="users" class="mx-auto max-w-7xl px-8" buffer={3000} itemsElement="tbody">
  <div slot="loading">
    <div class="flex justify-center py-16">
      <Spinner class="size-6 text-gray-400" />
    </div>
  </div>

  <div class="overflow-hidden rounded-2xl shadow ring-1 ring-gray-200">
    <table class="min-w-full">
      <thead class="bg-gray-50">
        <tr>
          <th class="px-6 py-4 text-left text-sm font-semibold text-gray-900">ID</th>
          <th class="px-6 py-4 text-left text-sm font-semibold text-gray-900">Name</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-200 bg-white">
        {#each users.data as user (user.id)}
          <tr class="transition-colors hover:bg-gray-50">
            <td class="px-6 py-4 text-sm text-gray-700">{user.id}</td>
            <td class="px-6 py-4 text-sm text-gray-700">{user.name}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</InfiniteScroll>
