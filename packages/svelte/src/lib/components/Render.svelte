<script context="module" lang="ts">
  import type { PageProps } from '@inertiajs/core'
  import type { ComponentType } from 'svelte'

  type RenderProps = {
    component: ComponentType
    props?: PageProps
    children?: RenderProps[]
  } | null

  export const h = (component: ComponentType, props?: PageProps, children?: RenderProps[]): RenderProps => {
    return {
      component,
      ...(props ? { props } : {}),
      ...(children ? { children } : {}),
    }
  }
</script>

<script lang="ts">
  import store from '../store'

  export let component: ComponentType
  export let props: PageProps = {}
  export let children: RenderProps[] = []

  let prevComponent: ComponentType
  let key: number
  $: {
    if (prevComponent !== component) {
      key = Date.now()
      prevComponent = component
    }
  }
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
