<script lang="ts">
  import { router } from '@inertiajs/svelte'

  let { foo, bar }: { foo: string; bar: string } = $props()

  const pushWithoutPreserving = () => {
    router.push({
      url: '/once-props/client-side-visit',
      component: 'OnceProps/ClientSideVisit',
      props: { bar: 'bar-updated' },
    })
  }

  const pushWithOnceProps = () => {
    router.push({
      url: '/once-props/client-side-visit',
      component: 'OnceProps/ClientSideVisit',
      props: (currentProps, onceProps) => ({ ...onceProps, bar: 'bar-updated' }),
    })
  }
</script>

<p id="foo">Foo: {foo}</p>
<p id="bar">Bar: {bar}</p>
<button onclick={pushWithoutPreserving}>Push without preserving</button>
<button onclick={pushWithOnceProps}>Push with once props</button>
