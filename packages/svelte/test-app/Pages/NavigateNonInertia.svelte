<script lang="ts">
  function navigate(e: MouseEvent) {
    e.preventDefault()
    window.history.replaceState({ foo: {} }, '')
    window.location.href = '/non-inertia'
  }
</script>

<div>
  <h1>Navigate Non-Inertia</h1>
  <p>
    <a href="/non-inertia" on:click={navigate}>Go to non-Inertia page</a>
  </p>
</div>
