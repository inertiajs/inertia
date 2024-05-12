<template>
  <div>
    <label>
      Full Name
      <input type="text" id="name" name="name" v-model="form.name" />
    </label>
    <label>
      Remember Me
      <input type="checkbox" id="remember" name="remember" v-model="form.remember" />
    </label>

    <span @click="postForm" class="post">POST form</span>
    <span @click="putForm" class="put">PUT form</span>
    <span @click="patchForm" class="patch">PATCH form</span>
    <span @click="deleteForm" class="delete">DELETE form</span>
  </div>
</template>
<script>
export default {
  data() {
    return {
      form: this.$inertia.form({
        name: 'foo',
        remember: false,
      }),
    }
  },
  methods: {
    postForm() {
      this.form.post('/dump/post')
    },
    putForm() {
      this.form.put('/dump/put')
    },
    patchForm() {
      this.form.patch('/dump/patch')
    },
    deleteForm() {
      this.form.delete('/dump/delete')
    },
  },
}
</script>
