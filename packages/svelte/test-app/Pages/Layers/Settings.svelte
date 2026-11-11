<script lang="ts">
  import { inertia, setLayoutProps, useLayer } from '@inertiajs/svelte'

  const layer = useLayer()

  setLayoutProps({ layerChrome: 'layer' }, layer.id)
</script>

<div>Account settings</div>
<a href="/layers/settings" use:inertia>Open settings again</a>
