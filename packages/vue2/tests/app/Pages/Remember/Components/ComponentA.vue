<template>
  <div>
    <span>This component uses a string 'key' for the remember functionality.</span>
    <label>
      Full Name
      <input type="text" class="a-name" name="full_name" v-model="name" />
    </label>
    <label>
      Remember Me
      <input type="checkbox" class="a-remember" name="remember" v-model="remember" />
    </label>
    <label>
      Remember Me
      <input type="text" class="a-untracked" name="untracked" v-model="untracked" />
    </label>
  </div>
</template>
<script>
export default {
  remember: {
    data: ['name', 'remember'],
    key: 'Example/ComponentA',
  },
  data: () => ({
    name: '',
    remember: false,
    untracked: '',
  }),
}
</script>
