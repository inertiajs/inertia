<template>
  <div>
    <!-- Listeners -->
    <span @click="withoutEventListeners" class="without-listeners">Basic Visit</span>
    <span @click="removeInertiaListener" class="remove-inertia-listener">Remove Inertia Listener</span>

    <!-- Events: Before -->
    <span @click="beforeVisit" class="before">Before Event</span>
    <span @click="beforeVisitPreventLocal" class="before-prevent-local">Before Event</span>
    <span @click="beforeVisitPreventGlobalInertia" class="before-prevent-global-inertia">Before Event - Prevent globally using Inertia Event Listener</span>
    <span @click="beforeVisitPreventGlobalNative" class="before-prevent-global-native">Before Event - Prevent globally using Native Event Listeners</span>
  </div>
</template>
<script>
import { Inertia } from '@inertiajs/inertia'

export default {
  methods: {
    withoutEventListeners() {
      this.$inertia.post(this.$page.url, {})
    },
    removeInertiaListener() {
      const removeEventListener = Inertia.on('before', () => alert('Inertia.on(before)'))

      alert('Removing Inertia.on Listener')
      removeEventListener();

      this.$inertia.post(this.$page.url, {}, {
        onBefore: () => alert('onBefore'),
        onStart: () => alert('onStart')
      })
    },
    beforeVisit() {
      Inertia.on('before', event => {
        alert('Inertia.on(before)')
        alert(event)
      })

      document.addEventListener('inertia:before', event => {
        alert('addEventListener(inertia:before)')
        alert(event)
      })

      this.$inertia.post(this.$page.url, {}, {
        onBefore: event => {
          alert('onBefore')
          alert(event)
        },
        onStart: () => alert('onStart')
      })
    },
    beforeVisitPreventLocal() {
      document.addEventListener('inertia:before', () => alert('addEventListener(inertia:before)'))
      Inertia.on('before', () => alert('Inertia.on(before)'))

      this.$inertia.post(this.$page.url, {}, {
        onBefore: () => {
          alert('onBefore')
          return false
        },
        onStart: () => alert('This event should not have been called.')
      })
    },
    beforeVisitPreventGlobalInertia() {
      document.addEventListener('inertia:before', () => alert('addEventListener(inertia:before)'))
      Inertia.on('before', visit => {
        alert('Inertia.on(before)')
        return false
      })

      this.$inertia.post(this.$page.url, {}, {
        onBefore: () => alert('onBefore'),
        onStart: () => alert('This event should not have been called.')
      })
    },
    beforeVisitPreventGlobalNative() {
      Inertia.on('before', () => alert('Inertia.on(before)'))
      document.addEventListener('inertia:before', event => {
        alert('addEventListener(inertia:before)')
        event.preventDefault()
      })

      this.$inertia.post(this.$page.url, {}, {
        onBefore: () => alert('onBefore'),
        onStart: () => alert('This event should not have been called.')
      })
    },
  }
}
</script>
