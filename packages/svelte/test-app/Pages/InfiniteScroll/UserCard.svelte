<script context="module" lang="ts">
  export interface User {
    id: number
    name: string
  }
</script>

<script lang="ts">
  export let user: User
</script>

<div
  data-user-id={user.id}
  style:height="15vh"
  style:border="1px solid #ccc"
  style:background-color={`rgba(150,150,150,${user.id / 40})`}
  style:color="green"
  style:display="flex"
  style:align-items="center"
  style:justify-content="center"
>
  {user.name}
</div>
