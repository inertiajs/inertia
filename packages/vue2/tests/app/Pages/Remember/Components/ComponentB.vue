<template>
  <div>
    <span>This component uses a callback-style 'key' for the remember functionality.</span>
    <label>
      Full Name
      <input type="text" class="b-name" name="full_name" v-model="name" />
    </label>
    <label>
      Remember Me
      <input type="checkbox" class="b-remember" name="remember" v-model="remember" />
    </label>
    <label>
      Remember Me
      <input type="text" class="b-untracked" name="untracked" v-model="untracked" />
    </label>
  </div>
</template>
<script>
export default {
  remember: {
    data: ['name', 'remember'],
    key: () => 'Example/ComponentB',
  },
  data: () => ({
    name: '',
    remember: false,
    untracked: '',
  }),
}
</script>
