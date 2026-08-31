<script setup lang="ts">
import { Form, Link, useForm } from '@inertiajs/vue3'

const form = useForm({ name: 'foo' }).preventNavigationWhenDirty()
</script>

<template>
  <div>
    <div id="dirty-status">Form is <span v-if="form.isDirty">dirty</span><span v-else>clean</span></div>

    <label>
      Name
      <input type="text" id="name" v-model="form.name" />
    </label>

    <button type="button" class="submit" @click="form.post('/form-helper/prevent-navigation-when-dirty')">
      Submit form
    </button>

    <Link href="/form-helper/data" id="navigate-away">Navigate away</Link>

    <Form
      action="/form-helper/prevent-navigation-when-dirty"
      method="post"
      :prevent-navigation-when-dirty="true"
      id="guarded-form"
    >
      <template #default="{ isDirty, processing }">
        <div id="form-component-dirty-status">
          Form component is <span v-if="isDirty">dirty</span><span v-else>clean</span>
        </div>
        <input type="text" name="title" id="form-title" value="initial" />
        <button type="submit" :disabled="processing">Submit guarded form</button>
      </template>
    </Form>

    <Link href="/form-helper/data" id="navigate-away-from-form">Navigate away from form</Link>
  </div>
</template>
