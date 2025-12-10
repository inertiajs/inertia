<script lang="ts">
  import { Link } from '@inertiajs/svelte'
</script>

<Link href="/once-props/page-a">Go to Page A</Link>
<Link href="/once-props/page-b">Go to Page B</Link>
<Link href="/once-props/page-d" prefetch="mount">Go to Page D</Link>
