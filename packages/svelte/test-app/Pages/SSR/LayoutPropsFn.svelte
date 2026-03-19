<script lang="ts" module>
  import SSRLayout from '../../Layouts/SSRLayout.svelte'

  export const layout = SSRLayout
  export const layoutProps = (layout: (...args: unknown[]) => void, props: Record<string, unknown>) => {
    layout({ title: props.pageTitle })
  }
</script>

<div>
  <p data-testid="page-content">Function Form Content</p>
</div>
