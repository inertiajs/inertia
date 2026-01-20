<script lang="ts">
  interface Props {
    foo: string
    bar: string
  }

  let { foo, bar }: Props = $props()
</script>

<p id="foo">Foo: {foo}</p>
<p id="bar">Bar: {bar}</p>
