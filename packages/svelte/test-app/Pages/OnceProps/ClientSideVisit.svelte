<script lang="ts">
  import { router } from '@inertiajs/svelte'

  export let foo: string
  export let bar: string

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
<button on:click={pushWithoutPreserving}>Push without preserving</button>
<button on:click={pushWithOnceProps}>Push with once props</button>
