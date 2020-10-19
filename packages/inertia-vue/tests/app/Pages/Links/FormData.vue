<template>
  <div>
    <span class="text">This is the data Links page</span>
    <inertia-link href="/links-target/get" :data="linkData" class="basic">Basic visit Link</inertia-link>

    <inertia-link method="GET" href="/links-target/get" :data="linkData" class="get">GET Link</inertia-link>
    <inertia-link method="POST" href="/links-target/post" :data="linkData" class="post">POST Link</inertia-link>
    <inertia-link method="PUT" href="/links-target/put" :data="linkData" class="put">PUT Link</inertia-link>
    <inertia-link method="PATCH" href="/links-target/patch" :data="linkData" class="patch">PATCH Link</inertia-link>
    <inertia-link method="DELETE" href="/links-target/delete" :data="linkData" class="delete">DELETE Link</inertia-link>
  </div>
</template>
<script>
  export default {
    data: () => ({
      linkData: new FormData,
    }),
    created() {
      this.linkData.append('bar', 'baz')
    }
  }
</script>
