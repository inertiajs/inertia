<script setup lang="ts">
import { Link, usePage } from '@inertiajs/vue3'
import Child from './Child.vue'

interface Props {
  title: string
}

const { title } = defineProps<Props>()

const pageA = usePage()
const pageB = usePage()
</script>

<template>
  <div>
    <h2>Page 2</h2>

    <p data-testid="title-props">
      Title (props): <strong>{{ title }}</strong>
    </p>
    <p data-testid="title-usepage">
      Title (usePage): <strong>{{ pageA.props.title }}</strong>
    </p>
    <p data-testid="url">URL: {{ pageA.url }}</p>
    <p data-testid="same-ref">
      usePage() same instance: <strong>{{ pageA === pageB ? 'yes' : 'no' }}</strong>
    </p>

    <hr />

    <Child :parent-page="pageA" />

    <hr />

    <Link data-testid="go-page1" href="/use-page/page1">Go to Page 1</Link>
  </div>
</template>
