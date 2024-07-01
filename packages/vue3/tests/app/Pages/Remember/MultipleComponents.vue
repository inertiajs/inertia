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

    <component-a class="component-a" />
    <component-b class="component-b" />

    <inertia-link href="/dump/get" class="link">Navigate away</inertia-link>
    <a href="/non-inertia" class="off-site">Navigate off-site</a>
  </div>
</template>
<script>
import ComponentA from '@/Pages/Remember/Components/ComponentA.vue'
import ComponentB from '@/Pages/Remember/Components/ComponentB.vue'

export default {
  components: {
    ComponentA,
    ComponentB,
  },
  remember: ['name', 'remember'],
  data: () => ({
    name: '',
    remember: false,
    untracked: '',
  }),
}
</script>
