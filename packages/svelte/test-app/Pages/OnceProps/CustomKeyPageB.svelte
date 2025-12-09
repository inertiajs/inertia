<script lang="ts">
  import { Link } from '@inertiajs/svelte'

  export let permissions: string
  export let bar: string
</script>

<p id="permissions">Permissions: {permissions}</p>
<p id="bar">Bar: {bar}</p>
<Link href="/once-props/custom-key/a">Go to Custom Key Page A</Link>
