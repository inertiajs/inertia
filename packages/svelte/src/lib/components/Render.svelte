<script context="module" lang="ts">
  import type { PageProps } from '@inertiajs/core'
  import type { InertiaComponentType } from '../types'

  type RenderProps = {
    component: InertiaComponentType
    props?: PageProps
    children?: RenderProps[]
  } | null

  export const h = (component: InertiaComponentType, props?: PageProps, children?: RenderProps[]): RenderProps => {
    return {
      component,
      ...(props ? { props } : {}),
      ...(children ? { children } : {}),
    }
  }
</script>

<script lang="ts">
  import store from '../store'

  export let component: InertiaComponentType
  export let props: PageProps = {}
  export let children: RenderProps[] = []

  let prev = component
  let key = new Date().getTime()

  function updateKey(component: InertiaComponentType) {
    if (prev !== component) {
      prev = component
      key = new Date().getTime()
    }
  }

  $: updateKey(component)
</script>

{#if $store.component}
  {#key key}
    <svelte:component this={component} {...props}>
      {#each children as child, index (component && component.length === index ? $store.key : null)}
        <svelte:self {...child} />
      {/each}
    </svelte:component>
  {/key}
{/if}
