<script>
  import { Inertia } from '@inertiajs/inertia'
  import store from './store'

  export let
    initialPage,
    resolveComponent,
    transformProps = props => props

  Inertia.init({
    initialPage,
    resolveComponent,
    updatePage: (component, props, { preserveState }) => {
      store.update(page => ({
        component,
        key: preserveState ? page.key : Date.now(),
        props: transformProps(props),
      }))
    },
  })
</script>

{#each [$store.key] as key (key)}
<svelte:component this={$store.component} {...$store.props} />
{/each}
