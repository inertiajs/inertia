<script setup lang="ts">
import { Link, router } from '@inertiajs/vue3'

defineProps<{
  foo: string
  auth?: { user: string }
}>()

const visitWithComponent = () => {
  router.visit('/instant-visit/target?delay=500', {
    component: 'InstantVisit/Target',
  })
}

const visitWithComponentAndPageProps = () => {
  router.visit('/instant-visit/target?delay=500', {
    component: 'InstantVisit/Target',
    pageProps: { greeting: 'Placeholder greeting' },
  })
}

const visitRedirecting = () => {
  router.visit('/instant-visit/redirecting?delay=500', {
    component: 'InstantVisit/Target',
  })
}

const visitWithPagePropsCallback = () => {
  router.visit('/instant-visit/target?delay=500', {
    component: 'InstantVisit/Target',
    pageProps: (currentProps) => ({ greeting: `Was on page with foo: ${currentProps.foo}` }),
  })
}

const visitWithPagePropsCallbackUsingShared = () => {
  router.visit('/instant-visit/target?delay=500', {
    component: 'InstantVisit/Target',
    pageProps: (_currentProps, sharedProps) => ({
      ...sharedProps,
      greeting: 'Placeholder with shared',
    }),
  })
}

const visitDeferred = () => {
  router.visit('/instant-visit/deferred?delay=500', {
    component: 'InstantVisit/Deferred',
    pageProps: { title: 'Placeholder Title' },
  })
}
</script>

<template>
  <div>
    <div id="page1">This is Page1</div>
    <div>Foo: {{ foo }}</div>
    <div id="auth">Auth: {{ auth?.user ?? 'none' }}</div>

    <button @click="visitWithComponent">Visit with component</button>
    <button @click="visitWithComponentAndPageProps">Visit with component and pageProps</button>
    <button @click="visitWithPagePropsCallback">Visit with pageProps callback</button>
    <button @click="visitWithPagePropsCallbackUsingShared">Visit with pageProps callback using shared</button>
    <button @click="visitRedirecting">Visit redirecting</button>
    <button @click="visitDeferred">Visit deferred</button>

    <Link href="/instant-visit/target?delay=500" component="InstantVisit/Target">Link with component</Link>
    <Link
      :href="{ url: '/instant-visit/target?delay=500', method: 'get', component: 'InstantVisit/Target' }"
      client-side
    >
      Link with clientSide
    </Link>
    <Link
      :href="{ url: '/instant-visit/target?delay=500', method: 'get', component: ['InstantVisit/Target', 'InstantVisit/Other'] }"
      client-side
      component="InstantVisit/Target"
    >
      Link with array component and explicit override
    </Link>
    <Link
      :href="{ url: '/instant-visit/target?delay=500', method: 'get', component: ['InstantVisit/Target', 'InstantVisit/Other'] }"
      client-side
    >
      Link with array component
    </Link>
  </div>
</template>
