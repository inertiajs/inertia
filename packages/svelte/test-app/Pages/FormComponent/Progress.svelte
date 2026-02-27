<script lang="ts">
  import { Form } from '@inertiajs/svelte'
  import { onMount, onDestroy } from 'svelte'

  let showProgress: boolean | undefined = $state(undefined)
  let nprogressVisible = false
  let nprogressAppearances = $state(0)
  let observer: MutationObserver | null = null

  function disableProgress() {
    showProgress = false
  }

  onMount(() => {
    observer = new MutationObserver(() => {
      const nprogressElement = document.querySelector('#nprogress') as HTMLElement | null
      const nprogressIsCurrentlyVisible =
        nprogressElement &&
        ('popover' in HTMLElement.prototype
          ? nprogressElement.matches(':popover-open')
          : nprogressElement.style.display !== 'none')

      if (nprogressIsCurrentlyVisible) {
        if (!nprogressVisible) {
          nprogressVisible = true
          nprogressAppearances = nprogressAppearances + 1
        }
      } else {
        nprogressVisible = false
      }
    })

    observer.observe(document.body, { childList: true, subtree: true })
  })

  onDestroy(() => {
    if (observer) {
      observer.disconnect()
    }
  })
</script>

<Form action="/form-component/progress" method="post" {showProgress}>
  <h1>Progress</h1>

  <div>
    Nprogress appearances: <span id="nprogress-appearances">{nprogressAppearances}</span>
  </div>

  <div>
    <button type="button" onclick={disableProgress}>Disable Progress</button>
    <button type="submit">Submit</button>
  </div>
</Form>
