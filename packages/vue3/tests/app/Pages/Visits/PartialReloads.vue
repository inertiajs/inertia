<template>
  <div>
    <span class="text">This is the page that demonstrates partial reloads using manual visits</span>
    <span class="foo-text">Foo is now {{ foo }}</span>
    <span class="bar-text">Bar is now {{ bar }}</span>
    <span class="baz-text">Baz is now {{ baz }}</span>
    <pre class="headers">{{ headers }}</pre>

    <span @click="partialReloadVisit" class="visit">Update All (visit)</span>
    <span @click="partialReloadVisitFooBar" class="visit-foo-bar">'Only' foo + bar (visit)</span>
    <span @click="partialReloadVisitBaz" class="visit-baz">'Only' baz (visit)</span>
    <span @click="partialReloadVisitExceptFooBar" class="visit-except-foo-bar">'Except' foo + bar (visit)</span>
    <span @click="partialReloadVisitExceptBaz" class="visit-except-baz">'Except' baz (visit)</span>

    <span @click="partialReloadGet" class="get">Update All (GET)</span>
    <span @click="partialReloadGetFooBar" class="get-foo-bar">'Only' foo + bar (GET)</span>
    <span @click="partialReloadGetBaz" class="get-baz">'Only' baz (GET)</span>
    <span @click="partialReloadGetExceptFooBar" class="get-except-foo-bar">'Except' foo + bar (GET)</span>
    <span @click="partialReloadGetExceptBaz" class="get-except-baz">'Except' baz (GET)</span>
  </div>
</template>
<script>
export default {
  props: {
    foo: {
      type: Number,
      default: 0,
    },
    bar: Number,
    baz: Number,
    headers: Object,
  },
  created() {
    window._inertia_props = this.$page.props
  },
  methods: {
    partialReloadVisit() {
      this.$inertia.visit('/visits/partial-reloads', {
        data: { foo: this.foo },
      })
    },
    partialReloadVisitFooBar() {
      this.$inertia.visit('/visits/partial-reloads', {
        data: { foo: this.foo },
        only: ['headers', 'foo', 'bar'],
      })
    },
    partialReloadVisitBaz() {
      this.$inertia.visit('/visits/partial-reloads', {
        data: { foo: this.foo },
        only: ['headers', 'baz'],
      })
    },
    partialReloadVisitExceptFooBar() {
      this.$inertia.visit('/visits/partial-reloads', {
        data: { foo: this.foo },
        except: ['foo', 'bar'],
      })
    },
    partialReloadVisitExceptBaz() {
      this.$inertia.visit('/visits/partial-reloads', {
        data: { foo: this.foo },
        except: ['baz'],
      })
    },
    partialReloadGet() {
      this.$inertia.get('/visits/partial-reloads', {
        foo: this.foo,
      })
    },
    partialReloadGetFooBar() {
      this.$inertia.get(
        '/visits/partial-reloads',
        {
          foo: this.foo,
        },
        {
          only: ['headers', 'foo', 'bar'],
        },
      )
    },
    partialReloadGetBaz() {
      this.$inertia.get(
        '/visits/partial-reloads',
        {
          foo: this.foo,
        },
        {
          only: ['headers', 'baz'],
        },
      )
    },
    partialReloadGetExceptFooBar() {
      this.$inertia.get(
        '/visits/partial-reloads',
        {
          foo: this.foo,
        },
        {
          except: ['foo', 'bar'],
        },
      )
    },
    partialReloadGetExceptBaz() {
      this.$inertia.get(
        '/visits/partial-reloads',
        {
          foo: this.foo,
        },
        {
          except: ['baz'],
        },
      )
    },
  },
}
</script>
