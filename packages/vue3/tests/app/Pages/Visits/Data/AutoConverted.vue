<template>
  <div>
    <span class="text"
      >This is the page that demonstrates automatic conversion of plain objects to form-data using manual visits</span
    >

    <span @click="visitMethod" class="visit">Visit Link</span>
    <span @click="postMethod" class="post">POST Link</span>
    <span @click="putMethod" class="put">PUT Link</span>
    <span @click="patchMethod" class="patch">PATCH Link</span>
    <span @click="deleteMethod" class="delete">DELETE Link</span>
  </div>
</template>
<script>
export default {
  data: () => ({
    formData: {
      file: new File([], 'example.jpg'),
      foo: 'bar',
    },
  }),
  methods: {
    visitMethod() {
      this.$inertia.visit('/dump/post', {
        method: 'post',
        data: this.formData,
      })
    },
    postMethod() {
      this.$inertia.post('/dump/post', this.formData)
    },
    putMethod() {
      this.$inertia.put('/dump/put', this.formData)
    },
    patchMethod() {
      this.$inertia.patch('/dump/patch', this.formData)
    },
    deleteMethod() {
      this.$inertia.delete('/dump/delete', {
        data: this.formData,
      })
    },
  },
}
</script>
