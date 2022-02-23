<template>
  <div>
    <label>
      Full Name
      <input type="text" id="name" name="name" v-model="form.name" />
    </label>
    <span class="name_error" v-if="form.errors.name">{{ form.errors.name }}</span>

    <span @click="submit" class="submit">Submit form</span>
    <span @click="submitDelayedSuccessful" class="submit-with-delayed-successful">Submit delayed successful form</span>

    <span @click="resetAll" class="reset">Reset all data</span>

    <span class="is-dirty-status">Form is {{ form.isDirty ? '' : 'not ' }}dirty</span>
    <span class="is-processing">Form is {{ form.processing ? '' : 'not ' }}processing</span>
    <span class="is-recently-successful">Form is {{ form.recentlySuccessful ? '' : 'not ' }}recently successful</span>
    <span class="delayed-is-recently-successful">Form is {{ formDelayedSuccessful.recentlySuccessful ? '' : 'not ' }}recently successful</span>
  </div>
</template>
<script>
export default {
  data() {
    return {
      form: this.$inertia.form({
        name: 'foo',
      }),
      formDelayedSuccessful: this.$inertia.form({
        name: 'foo',
      }, {
          recentlySuccessfulDelay: 5000,
      })
    }
  },
  methods: {
    submit() {
      this.form.post(this.$page.url)
    },
    submitDelayedSuccessful() {
      this.formDelayedSuccessful.post(this.$page.url, {
        recentlySuccessfulDelay: 5000,
      })
    },
    resetAll() {
      this.form.reset()
    },
  }
}
</script>
