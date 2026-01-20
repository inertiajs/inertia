<script setup lang="ts">
import { Link, useForm } from '@inertiajs/vue3'

const form = useForm('password-form', {
  username: '',
  password: '',
}).dontRemember('password')
</script>

<template>
  <div>
    <label>
      Username
      <input type="text" id="username" v-model="form.username" />
    </label>
    <label>
      Password
      <input type="password" id="password" v-model="form.password" />
    </label>

    <Link href="/dump/get" class="link">Navigate away</Link>
  </div>
</template>
