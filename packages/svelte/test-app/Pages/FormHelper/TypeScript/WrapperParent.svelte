<script lang="ts">
  // This component is used for checking the TypeScript implementation; there is no Playwright test depending on it.
  import WrapperChild from './WrapperChild.svelte'

  const dummyForm = {
    header: '',
    children: [
      {
        title: '',
        active: false,
      },
    ],
  }
</script>

<WrapperChild data={dummyForm}>
  {#snippet children(form)}
    {form.children.map((child) => child.title)}
  {/snippet}
</WrapperChild>
