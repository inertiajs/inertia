<script setup>
import { Link, useRemember } from '@inertiajs/vue3'
import { ref } from 'vue'

const untracked = ref('')

const form = useRemember({
  name: '',
  remember: false,
})
</script>

<template>
  <div>
    <label>
      Full Name
      <input type="text" id="name" name="full_name" v-model="form.name" />
    </label>
    <label>
      Remember Me
      <input type="checkbox" id="remember" name="remember" v-model="form.remember" />
    </label>
    <label>
      Untracked
      <input type="text" id="untracked" name="untracked" v-model="untracked" />
    </label>

    <Link href="/dump/get" class="link">Navigate away</Link>
  </div>
</template>
