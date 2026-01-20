<script lang="ts" module>
  declare module '@inertiajs/core' {
    export interface InertiaConfig {
      flashDataType: {
        toast?: { type: 'success' | 'error'; message: string }
      }
    }
  }
</script>

<script lang="ts">
  // This component is used for checking the TypeScript implementation; there is no Playwright test depending on it.
  import { router, page } from '@inertiajs/svelte'

  // page.flash is always an object
  let flash = $derived(page.flash)
  let toast = $derived(page.flash.toast)
  let toastMessage = $derived(page.flash.toast?.message)
  let toastType = $derived(page.flash.toast?.type)

  // @ts-expect-error - 'message' does not exist on flash (it's on toast)
  let flashMessage = $derived(page.flash.message)

  // router.flash with object
  router.flash({ toast: { type: 'success', message: 'Hello' } })

  // router.flash with key-value
  router.flash('toast', { type: 'error', message: 'Oops' })

  // router.flash with callback
  router.flash((current) => ({
    ...current,
    toast: { type: 'success', message: 'Updated' },
  }))

  // Client-side visit with flash
  router.replace({
    flash: { toast: { type: 'success', message: 'Replaced' } },
    onFlash: (flash) => {
      console.log(flash.toast?.message)
    },
  })

  // Client-side visit with flash callback
  router.push({
    flash: (current) => ({
      ...current,
      toast: { type: 'error', message: 'Error' },
    }),
  })

  // Scoped flash typing with generic (for page/section-specific flash)
  router.flash<{ paymentError: string }>({ paymentError: 'Card declined' })

  // @ts-expect-error - 'paymentError' should be string, not number
  router.flash<{ paymentError: string }>({ paymentError: 123 })

  $effect.pre(() => {
    console.log({
      flash,
      toast,
      toastMessage,
      toastType,
      flashMessage,
    })
  })
</script>

{#if page.flash.toast}
  {page.flash.toast.message}
{/if}
