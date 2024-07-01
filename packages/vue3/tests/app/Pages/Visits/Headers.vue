<template>
  <div>
    <span class="text">This is the page that demonstrates passing custom headers through manual visits</span>

    <span @click="defaultHeadersMethod" class="default">Standard visit Link</span>

    <span @click="visitWithCustomHeaders" class="visit">Specific visit Link</span>
    <span @click="getMethod" class="get">GET Link</span>
    <span @click="postMethod" class="post">POST Link</span>
    <span @click="putMethod" class="put">PUT Link</span>
    <span @click="patchMethod" class="patch">PATCH Link</span>
    <span @click="deleteMethod" class="delete">DELETE Link</span>

    <span @click="overridden" class="overridden">DELETE Link</span>
  </div>
</template>
<script>
export default {
  methods: {
    defaultHeadersMethod() {
      this.$inertia.visit('/dump/get')
    },
    visitWithCustomHeaders() {
      this.$inertia.visit('/dump/get', {
        headers: {
          foo: 'bar',
        },
      })
    },
    getMethod() {
      this.$inertia.get(
        '/dump/get',
        {},
        {
          headers: {
            bar: 'baz',
          },
        },
      )
    },
    postMethod() {
      this.$inertia.post(
        '/dump/post',
        {},
        {
          headers: {
            baz: 'foo',
          },
        },
      )
    },
    putMethod() {
      this.$inertia.put(
        '/dump/put',
        {},
        {
          headers: {
            foo: 'bar',
          },
        },
      )
    },
    patchMethod() {
      this.$inertia.patch(
        '/dump/patch',
        {},
        {
          headers: {
            bar: 'baz',
          },
        },
      )
    },
    deleteMethod() {
      this.$inertia.delete('/dump/delete', {
        headers: {
          baz: 'foo',
        },
      })
    },
    overridden() {
      this.$inertia.post(
        '/dump/post',
        {},
        {
          headers: {
            bar: 'baz',
            'X-Requested-With': 'custom',
          },
        },
      )
    },
  },
}
</script>
