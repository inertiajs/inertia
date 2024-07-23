<script setup>
import { Link } from '@inertiajs/vue3'
import { ref } from 'vue'

const name = ref('')
const remember = ref(false)
const untracked = ref('')
</script>

<template>
  <div>
    <label>
      Full Name
      <input type="text" id="name" name="full_name" v-model="name" />
    </label>
    <label>
      Remember Me
      <input type="checkbox" id="remember" name="remember" v-model="remember" />
    </label>
    <label>
      Untracked
      <input type="text" id="untracked" name="untracked" v-model="untracked" />
    </label>

    <Link href="/dump/get" class="link">Navigate away</Link>
  </div>
</template>
