<script setup lang="ts" generic="TFormData extends Record<string, FormDataConvertible>">
import type { FormDataConvertible } from '@inertiajs/core'
import type { InertiaForm } from '@inertiajs/vue3'

const props = defineProps<{
  form: InertiaForm<TFormData>
}>()
</script>
