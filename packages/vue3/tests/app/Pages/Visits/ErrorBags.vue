<template>
  <div>
    <span class="text">This is the page that demonstrates error bags using manual visits</span>
    <span @click="defaultVisit" class="default">Default visit</span>
    <span @click="basicVisit" class="visit">Basic visit</span>
    <span @click="postVisit" class="get">POST visit</span>
  </div>
</template>
<script>
export default {
  methods: {
    defaultVisit() {
      this.$inertia.post('/dump/post')
    },
    basicVisit() {
      this.$inertia.visit('/dump/post', {
        method: 'post',
        data: { foo: 'bar' },
        errorBag: 'visitErrorBag',
      })
    },
    postVisit() {
      this.$inertia.post(
        '/dump/post',
        {
          foo: 'baz',
        },
        {
          errorBag: 'postErrorBag',
        },
      )
    },
  },
}
</script>
