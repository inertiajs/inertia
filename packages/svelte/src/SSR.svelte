<script>
  import App from './App.svelte'
  export let id, initialPage
</script>

<div data-server-rendered="true" {id} data-page={JSON.stringify(initialPage)}>
  <App />
</div>
