<script setup lang="ts">
import { Link, usePage } from '@inertiajs/vue3'
import Child from './Child.vue'

interface Props {
  name: string
}

const { name } = defineProps<Props>()

const pageA = usePage()
const pageB = usePage()
</script>

<template>
  <div>
    <h2>Page 1</h2>

    <p data-testid="name-props">
      Name (props): <strong>{{ name }}</strong>
    </p>
    <p data-testid="name-usepage">
      Name (usePage): <strong>{{ pageA.props.name }}</strong>
    </p>
    <p data-testid="url">URL: {{ pageA.url }}</p>
    <p data-testid="same-ref">
      usePage() same instance: <strong>{{ pageA === pageB ? 'yes' : 'no' }}</strong>
    </p>

    <hr />

    <Child :parent-page="pageA" />

    <hr />

    <Link data-testid="go-page2" href="/use-page/page2">Go to Page 2</Link>
  </div>
</template>
