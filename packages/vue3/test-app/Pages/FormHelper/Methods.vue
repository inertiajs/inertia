<script setup lang="ts">
import { useForm } from '@inertiajs/vue3'
const form = useForm({
  name: 'foo',
  remember: false,
})

const postForm = () => {
  form.post('/dump/post')
}

const putForm = () => {
  form.put('/dump/put')
}

const patchForm = () => {
  form.patch('/dump/patch')
}

const deleteForm = () => {
  form.delete('/dump/delete')
}

const submitForm = () => {
  form.submit('post', '/dump/post')
}

const submitFormObject = () => {
  form.submit({
    method: 'post',
    url: '/dump/post',
  })
}
</script>

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

    <button @click="postForm" class="post">POST form</button>
    <button @click="putForm" class="put">PUT form</button>
    <button @click="patchForm" class="patch">PATCH form</button>
    <button @click="deleteForm" class="delete">DELETE form</button>
    <button @click="submitForm" class="delete">SUBMIT form</button>
    <button @click="submitFormObject" class="delete">SUBMIT OBJECT form</button>
  </div>
</template>
