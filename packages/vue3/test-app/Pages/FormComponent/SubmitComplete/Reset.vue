<script setup lang="ts">
import { Form } from '@inertiajs/vue3'
</script>

<template>
  <div>
    <h1>OnSubmitComplete Reset Test</h1>

    <Form method="post" #default="{ errors }" @submit-complete="(props) => props.reset('name')">
      <div>
        <input type="text" name="name" id="name" placeholder="Name" value="John Doe" />
        <p v-if="errors.name" id="error_name">{{ errors.name }}</p>
      </div>

      <div>
        <input type="email" name="email" id="email" placeholder="Email" value="john@doe.biz" />
        <p v-if="errors.email" id="error_email">{{ errors.email }}</p>
      </div>

      <div>
        <button type="submit">Submit</button>
      </div>
    </Form>
  </div>
</template>
