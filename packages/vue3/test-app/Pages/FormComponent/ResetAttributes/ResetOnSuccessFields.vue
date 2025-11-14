<script setup lang="ts">
import { Form } from '@inertiajs/vue3'
</script>

<template>
  <Form method="post" action="/form-component/reset-on-success-fields" :reset-on-success="['name']">
    <div>
      <label for="name">Name</label>
      <input type="text" name="name" id="name" value="John Doe" />
      <p id="error_name">{{ $page.props.errors?.name }}</p>
    </div>

    <div>
      <label for="email">Email</label>
      <input type="email" name="email" id="email" value="john@doe.biz" />
      <p id="error_email">{{ $page.props.errors?.email }}</p>
    </div>

    <button type="submit">Submit</button>
  </Form>
</template>
