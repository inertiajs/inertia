<script setup>
import { useRemember } from '@inertiajs/vue3'
import { ref } from 'vue'

const untracked = ref('')

const data = useRemember(
  {
    name: '',
    remember: false,
  },
  'Example/ComponentB',
)
</script>

<template>
  <div>
    <span>This component uses a callback-style 'key' for the remember functionality.</span>
    <label>
      Full Name
      <input type="text" class="b-name" name="full_name" v-model="data.name" />
    </label>
    <label>
      Remember Me
      <input type="checkbox" class="b-remember" name="remember" v-model="data.remember" />
    </label>
    <label>
      Remember Me
      <input type="text" class="b-untracked" name="untracked" v-model="untracked" />
    </label>
  </div>
</template>
