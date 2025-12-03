<script lang="ts">
  import { Link } from '@inertiajs/svelte'

  export let userPermissions: string
  export let bar: string
</script>

<p id="permissions">Permissions: {userPermissions}</p>
<p id="bar">Bar: {bar}</p>
<Link href="/once-props/custom-key/b">Go to Custom Key Page B</Link>
