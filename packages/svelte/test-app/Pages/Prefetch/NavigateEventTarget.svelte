<script lang="ts">
  interface Props {
    label: string
  }

  let { label }: Props = $props()
</script>

<div>This is the {label} target</div>
