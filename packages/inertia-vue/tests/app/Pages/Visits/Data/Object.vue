<template>
  <div>
    <span class="text">This is the page that demonstrates manual visit data passing through plain objects</span>

    <span @click="visitMethod" class="visit">Visit Link</span>
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
    visitMethod() {
      this.$inertia.visit('/dump/get', {
        data: { foo: 'visit' }
      });
    },
    getMethod() {
      this.$inertia.get('/dump/get', {
        bar: 'get'
      });
    },
    postMethod() {
      this.$inertia.post('/dump/post', {
        baz: 'post'
      });
    },
    putMethod() {
      this.$inertia.put('/dump/put', {
        foo: 'put'
      });
    },
    patchMethod() {
      this.$inertia.patch('/dump/patch', {
        bar: 'patch'
      });
    },
    deleteMethod() {
      this.$inertia.delete('/dump/delete', {
        data: { baz: 'delete' }
      })
    },
  }
}
</script>
