<template>
  <div>
    <span class="text">This is the page that demonstrates Inertia visit promise deprecation</span>

    <span @click="thenPromise" class="then">The</span>
    <span @click="catchPromise" class="catch">Catch</span>
    <span @click="finallyPromise" class="finally">Finally</span>

    <span @click="thenPromiseGet" class="then-get">The</span>
    <span @click="catchPromiseGet" class="catch-get">Catch</span>
    <span @click="finallyPromiseGet" class="finally-get">Finally</span>
  </div>
</template>
<script>
export default {
 methods: {
   thenPromise() {
     this.$inertia.visit('/sleep').then(() => true)
   },
   catchPromise() {
     this.$inertia.visit('/sleep').catch(() => true)
   },
   finallyPromise() {
     this.$inertia.visit('/sleep').finally(() => true)
   },
   thenPromiseGet() {
     this.$inertia.get('/sleep').then(() => true)
   },
   catchPromiseGet() {
     this.$inertia.get('/sleep').catch(() => true)
   },
   finallyPromiseGet() {
     this.$inertia.get('/sleep').finally(() => true)
   }
 }
}
</script>
