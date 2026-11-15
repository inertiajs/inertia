<script lang="ts">
  import { inertia, Link } from '@inertiajs/svelte'

  let href = $state('/dump/get?step=one')

  const changeUrl = () => {
    href = '/dump/get?step=two'
  }
</script>

<div>
  <button onclick={changeUrl}>Change URL</button>
  <Link {href}>The Link</Link>
  <a {href} use:inertia>The Action Link</a>
  <a href="/links/href-change" use:inertia={{ href }}>The Action Parameter Link</a>
</div>
