<script>
  import Layout from '../Components/Layout.svelte'

  export let users
</script>

<Layout>
  <h1 class="text-3xl">Users</h1>
  <table>
    <thead>
      <tr>
        <th class="px-4 py-2">Id</th>
        <th class="px-4 py-2">Name</th>
        <th class="px-4 py-2">Email</th>
      </tr>
    </thead>
    <tbody>
      {#each users as user}
        <tr>
          <td class="border px-4 py-2">{user.id}</td>
          <td class="border px-4 py-2">{user.name}</td>
          <td class="border px-4 py-2">{user.email}</td>
        </tr>
      {/each}
    </tbody>
  </table>
</Layout>
