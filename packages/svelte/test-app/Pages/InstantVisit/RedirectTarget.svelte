<script lang="ts">
  let { redirected }: { redirected: boolean } = $props()
</script>

<div>
  <div id="redirect-target">This is RedirectTarget</div>
  <div id="redirected">Redirected: {String(redirected)}</div>
</div>
