<script lang="ts" module>
  import SSRLayout from '../../Layouts/SSRLayout.svelte'

  export const layout = (props: Record<string, unknown>) => [SSRLayout, { title: 'Profile: ' + props.pageTitle }]
</script>

<div>
  <p data-testid="page-content">Callback Content</p>
</div>
