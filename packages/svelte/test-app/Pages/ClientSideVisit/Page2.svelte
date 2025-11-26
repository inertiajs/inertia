<script lang="ts">
  interface Props {
    baz: string
  }

  let { baz }: Props = $props()
</script>

<div>{baz}</div>
