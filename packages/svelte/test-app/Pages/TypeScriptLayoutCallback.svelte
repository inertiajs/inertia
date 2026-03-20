<script lang="ts" module>
  declare module '@inertiajs/core' {
    export interface InertiaConfig {
      sharedPageProps: {
        auth: { user: { name: string } | null }
      }
    }
  }

  import AppLayout from '@/Layouts/AppLayout.svelte'
  import type { LayoutCallback } from '@inertiajs/svelte'

  export const layout: LayoutCallback = (props) => {
    const name: string | undefined = props.auth.user?.name

    // @ts-expect-error - 'nonExistent' does not exist on shared page props
    console.log(props.nonExistent)

    return [AppLayout, { title: name }]
  }
</script>
