<script setup lang="ts">
import { usePage } from '@inertiajs/vue3'

interface Props {
  parentPage: object
}

const { parentPage } = defineProps<Props>()

const page = usePage()
</script>

<template>
  <div>
    <p><em>From child component:</em></p>
    <p data-testid="child-url">URL: {{ page.url }}</p>
    <p data-testid="child-component">Component: {{ page.component }}</p>
    <p data-testid="child-same-ref">
      Same instance as parent: <strong>{{ page === parentPage ? 'yes' : 'no' }}</strong>
    </p>
  </div>
</template>
