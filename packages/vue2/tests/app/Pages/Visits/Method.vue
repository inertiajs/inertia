<template>
  <div>
    <span class="text">This is the page that demonstrates manual visit methods</span>

    <span @click="standardVisitMethod" class="visit-get">Standard visit Link</span>
    <span @click="specificVisitMethod" class="visit-specific">Specific visit Link</span>
    <span @click="getMethod" class="get">GET Link</span>
    <span @click="postMethod" class="post">POST Link</span>
    <span @click="putMethod" class="put">PUT Link</span>
    <span @click="patchMethod" class="patch">PATCH Link</span>
    <span @click="deleteMethod" class="delete">DELETE Link</span>
  </div>
</template>
<script>
export default {
  methods: {
    standardVisitMethod() {
      this.$inertia.visit('/dump/get')
    },
    specificVisitMethod() {
      this.$inertia.visit('/dump/patch', {
        method: 'patch',
      })
    },
    getMethod() {
      this.$inertia.get('/dump/get')
    },
    postMethod() {
      this.$inertia.post('/dump/post')
    },
    putMethod() {
      this.$inertia.put('/dump/put')
    },
    patchMethod() {
      this.$inertia.patch('/dump/patch')
    },
    deleteMethod() {
      this.$inertia.delete('/dump/delete')
    },
  },
}
</script>
