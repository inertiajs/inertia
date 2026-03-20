<script lang="ts" module>
  import SSRLayout from '../../Layouts/SSRLayout.svelte'

  export const layout = [SSRLayout, { title: 'Page A Title' }]
</script>

<div>
  <p data-testid="page-content">Page A Content</p>
</div>
