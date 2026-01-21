<script lang="ts">
  import { Link } from '@inertiajs/svelte'

  interface Props {
    permissions: string
    bar: string
  }

  let { permissions, bar }: Props = $props()
</script>

<p id="permissions">Permissions: {permissions}</p>
<p id="bar">Bar: {bar}</p>
<Link href="/once-props/custom-key/a">Go to Custom Key Page A</Link>
