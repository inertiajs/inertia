<script context="module" lang="ts">
  import { PageProps } from '@inertiajs/core'
  import { InertiaComponentType } from '../types'

  interface RenderProps {
    component: InertiaComponentType
    props?: PageProps
    children?: RenderProps[]
  }

  export const h = (component: InertiaComponentType, props?: PageProps, children?: RenderProps[]): RenderProps => {
    return {
      component,
      ...(props ? { props } : {}),
      ...(children ? { children } : {}),
    }
  }
</script>

<script lang="ts">
  import { store } from '../index'

  export let component: InertiaComponentType
  export let props: PageProps = {}
  export let children: RenderProps[] = []
</script>

{#if $store.component}
  <svelte:component this={component} {...props}>
    {#each children as child, index (component && component.length === index ? $store.key : null)}
      <svelte:self {...child} />
    {/each}
  </svelte:component>
{/if}
