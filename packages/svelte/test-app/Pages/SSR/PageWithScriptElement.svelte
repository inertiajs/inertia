<script lang="ts">
  interface Props {
    message: string
  }

  let { message }: Props = $props()
</script>

<div>
  <h1 data-testid="ssr-title">SSR Page With Script Element</h1>
  <p data-testid="message">{message}</p>
</div>
