<script setup>
import { Form } from '@inertiajs/vue3'
import { onMounted, onUnmounted, ref } from 'vue'

const showProgress = ref(undefined)

const nprogressVisible = ref(false)
const nprogressApperances = ref(0)

function disableProgress() {
  showProgress.value = false
}

onMounted(() => {
  const observer = new MutationObserver(() => {
    const nprogressElement = document.querySelector('#nprogress')
    const nprogressIsVisible = nprogressElement && nprogressElement.style.display !== 'none'

    if (nprogressIsVisible) {
      if (!nprogressVisible.value) {
        nprogressVisible.value = true
        nprogressApperances.value++
      }
    } else {
      nprogressVisible.value = false
    }
  })

  observer.observe(document.body, { childList: true, subtree: true })

  onUnmounted(() => {
    observer.disconnect()
  })
})
</script>

<template>
  <Form action="/form-component/progress" method="post" :show-progress="showProgress">
    <h1>Progress</h1>

    <div>
      Nprogress appearances: <span id="nprogress-appearances">{{ nprogressApperances }}</span>
    </div>

    <div>
      <button type="button" @click="disableProgress">Disable Progress</button>
      <button type="submit">Submit</button>
    </div>
  </Form>
</template>
