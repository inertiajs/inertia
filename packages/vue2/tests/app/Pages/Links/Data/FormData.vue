<template>
  <div>
    <span class="text">This is the links page that demonstrates passing data through FormData objects</span>

    <inertia-link method="GET" href="/dump/get" :data="linkData" class="get">GET Link</inertia-link>
    <inertia-link as="button" method="POST" href="/dump/post" :data="linkData" class="post">POST Link</inertia-link>
    <inertia-link as="button" method="PUT" href="/dump/put" :data="linkData" class="put">PUT Link</inertia-link>
    <inertia-link as="button" method="PATCH" href="/dump/patch" :data="linkData" class="patch">PATCH Link</inertia-link>
    <inertia-link as="button" method="DELETE" href="/dump/delete" :data="linkData" class="delete"
      >DELETE Link</inertia-link
    >
  </div>
</template>
<script>
export default {
  data: () => ({
    linkData: new FormData(),
  }),
  created() {
    this.linkData.append('bar', 'baz')
  },
}
</script>
