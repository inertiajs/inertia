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

    <inertia-link href="/dump/get" class="link">Navigate away</inertia-link>
  </div>
</template>
<script>
export default {
  remember: ['name', 'remember'],
  data: () => ({
    name: '',
    remember: false,
    untracked: '',
  }),
}
</script>
