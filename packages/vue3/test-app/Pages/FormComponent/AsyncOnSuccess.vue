<script setup lang="ts">
import { Form } from '@inertiajs/vue3'

const onSuccess = () => new Promise<void>((resolve) => setTimeout(resolve, 1500))
</script>

<template>
  <div>
    <h1>Form Async OnSuccess Test</h1>

    <Form
      method="post"
      action="/form-component/async-on-success/submit"
      disable-while-processing
      :on-success="onSuccess"
    >
      <div>
        <input type="text" name="name" placeholder="Name" value="John Doe" />
      </div>

      <div>
        <button type="submit">Submit</button>
      </div>
    </Form>
  </div>
</template>
