<script lang="ts">
  interface Props {
    text: string
  }

  let { text }: Props = $props()

  const characterCount = $derived(text.length)
  const replacementCount = $derived((text.match(/�/g) || []).length)
</script>

<div>
  <h1 data-testid="ssr-title">SSR Multi-Byte Body</h1>
  <p data-testid="character-count">Characters: {characterCount}</p>
  <p data-testid="replacement-count">Replacement characters: {replacementCount}</p>
  <p data-testid="text">{text}</p>
</div>
