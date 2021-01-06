<template>
  <div>
    <span class="text">This is the links page that demonstrates manual replace</span>

    <span @click="replace" class="replace">[State] Replace: true</span>
    <span @click="replaceFalse" class="replace-false">[State] Replace: false</span>
  </div>
</template>
<script>
export default {
  methods: {
    replace() {
      this.$inertia.visit('/dump/get', {
        replace: true
      })
    },
    replaceFalse() {
      this.$inertia.visit('/dump/get', {
        replace: false
      })
    }
  }
}
</script>
