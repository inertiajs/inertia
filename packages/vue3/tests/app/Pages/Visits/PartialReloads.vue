<script setup>
import { router, usePage } from '@inertiajs/vue3'
import { onMounted } from 'vue'

const props = defineProps({
  foo: {
    type: Number,
    default: 0,
  },
  bar: Number,
  baz: Number,
  headers: Object,
})

const page = usePage()

onMounted(() => {
  window._inertia_props = page.props
})

const partialReloadVisit = () => {
  router.visit('/visits/partial-reloads', {
    data: { foo: props.foo },
  })
}

const partialReloadVisitFooBar = () => {
  router.visit('/visits/partial-reloads', {
    data: { foo: props.foo },
    only: ['headers', 'foo', 'bar'],
  })
}

const partialReloadVisitBaz = () => {
  router.visit('/visits/partial-reloads', {
    data: { foo: props.foo },
    only: ['headers', 'baz'],
  })
}

const partialReloadVisitExceptFooBar = () => {
  router.visit('/visits/partial-reloads', {
    data: { foo: props.foo },
    except: ['foo', 'bar'],
  })
}

const partialReloadVisitExceptBaz = () => {
  router.visit('/visits/partial-reloads', {
    data: { foo: props.foo },
    except: ['baz'],
  })
}

const partialReloadGet = () => {
  router.get('/visits/partial-reloads', {
    foo: props.foo,
  })
}

const partialReloadGetFooBar = () => {
  router.get(
    '/visits/partial-reloads',
    {
      foo: props.foo,
    },
    {
      only: ['headers', 'foo', 'bar'],
    },
  )
}

const partialReloadGetBaz = () => {
  router.get(
    '/visits/partial-reloads',
    {
      foo: props.foo,
    },
    {
      only: ['headers', 'baz'],
    },
  )
}

const partialReloadGetExceptFooBar = () => {
  router.get(
    '/visits/partial-reloads',
    {
      foo: props.foo,
    },
    {
      except: ['foo', 'bar'],
    },
  )
}

const partialReloadGetExceptBaz = () => {
  router.get(
    '/visits/partial-reloads',
    {
      foo: props.foo,
    },
    {
      except: ['baz'],
    },
  )
}
</script>

<template>
  <div>
    <span class="text">This is the page that demonstrates partial reloads using manual visits</span>
    <span class="foo-text">Foo is now {{ foo }}</span>
    <span class="bar-text">Bar is now {{ bar }}</span>
    <span class="baz-text">Baz is now {{ baz }}</span>
    <pre class="headers">{{ headers }}</pre>

    <a href="#" @click="partialReloadVisit" class="visit">Update All (visit)</a>
    <a href="#" @click="partialReloadVisitFooBar" class="visit-foo-bar">'Only' foo + bar (visit)</a>
    <a href="#" @click="partialReloadVisitBaz" class="visit-baz">'Only' baz (visit)</a>
    <a href="#" @click="partialReloadVisitExceptFooBar" class="visit-except-foo-bar">'Except' foo + bar (visit)</a>
    <a href="#" @click="partialReloadVisitExceptBaz" class="visit-except-baz">'Except' baz (visit)</a>

    <a href="#" @click="partialReloadGet" class="get">Update All (GET)</a>
    <a href="#" @click="partialReloadGetFooBar" class="get-foo-bar">'Only' foo + bar (GET)</a>
    <a href="#" @click="partialReloadGetBaz" class="get-baz">'Only' baz (GET)</a>
    <a href="#" @click="partialReloadGetExceptFooBar" class="get-except-foo-bar">'Except' foo + bar (GET)</a>
    <a href="#" @click="partialReloadGetExceptBaz" class="get-except-baz">'Except' baz (GET)</a>
  </div>
</template>
