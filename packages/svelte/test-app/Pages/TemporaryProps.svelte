<script lang="ts">
  import { Link } from '@inertiajs/svelte'

  export let regular: number | undefined
  export let tmp: number | undefined
</script>

<div>regular is {regular ?? 'undefined'}</div>
<div>tmp is {tmp ?? 'undefined'}</div>
<Link href="/">homepage</Link>
