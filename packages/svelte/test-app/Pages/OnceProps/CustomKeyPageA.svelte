<script lang="ts">
  import { Link } from '@inertiajs/svelte'

  interface Props {
    userPermissions: string
    bar: string
  }

  let { userPermissions, bar }: Props = $props()
</script>

<p id="permissions">Permissions: {userPermissions}</p>
<p id="bar">Bar: {bar}</p>
<Link href="/once-props/custom-key/b">Go to Custom Key Page B</Link>
