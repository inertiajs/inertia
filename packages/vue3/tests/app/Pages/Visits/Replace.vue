<template>
  <div>
    <span class="text">This is the links page that demonstrates manual replace</span>

    <span @click="replace" class="replace">[State] Replace visit: true</span>
    <span @click="replaceFalse" class="replace-false">[State] Replace visit: false</span>
    <span @click="replaceGet" class="replace-get">[State] Replace GET: true</span>
    <span @click="replaceGetFalse" class="replace-get-false">[State] Replace GET: false</span>
  </div>
</template>
<script>
export default {
  methods: {
    replace() {
      this.$inertia.visit('/dump/get', {
        replace: true,
      })
    },
    replaceFalse() {
      this.$inertia.visit('/dump/get', {
        replace: false,
      })
    },
    replaceGet() {
      this.$inertia.get(
        '/dump/get',
        {},
        {
          replace: true,
        },
      )
    },
    replaceGetFalse() {
      this.$inertia.get(
        '/dump/get',
        {},
        {
          replace: false,
        },
      )
    },
  },
}
</script>
