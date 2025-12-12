<script lang="ts">
export default {
  data() {
    return {
      form: this.$inertia.form({
        email: 'test@test.com',
        password: '',
        remember: false,
      }),
    }
  },
  methods: {
    submit() {
      this.form.post('/dump/post')
    },
    resetAll() {
      this.form.reset()
    },
    clearEmail() {
      this.form.email = ''
    },
    setEmail() {
      this.form.email = 'changed@test.com'
    },
  },
}
</script>

<template>
  <div>
    <label>
      Email
      <input type="text" id="email" name="email" v-model="form.email" />
    </label>
    <span class="email-value">{{ form.email }}</span>
    <label>
      Password
      <input type="password" id="password" name="password" v-model="form.password" />
    </label>
    <span class="password-value">{{ form.password }}</span>
    <label>
      Remember Me
      <input type="checkbox" id="remember" name="remember" v-model="form.remember" />
    </label>
    <span class="remember-value">{{ form.remember }}</span>

    <button @click="submit" class="submit">Submit form</button>
    <button @click="resetAll" class="reset">Reset all data</button>
    <button @click="clearEmail" class="clear-email">Clear email</button>
    <button @click="setEmail" class="set-email">Set email programmatically</button>

    <span class="dirty-status">Form is {{ form.isDirty ? '' : 'not ' }}dirty</span>
    <span class="processing-status">Form is {{ form.processing ? '' : 'not ' }}processing</span>
  </div>
</template>
