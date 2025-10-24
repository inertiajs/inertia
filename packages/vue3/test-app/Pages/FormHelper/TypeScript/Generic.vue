<script setup lang="ts" generic="TFormData extends Record<string, FormDataConvertible>">
// This component is used for checking the TypeScript implementation; there is no Playwright test depending on it.
import type { FormDataConvertible } from '@inertiajs/core'
import type { InertiaForm } from '@inertiajs/vue3'

defineProps<{
  form: InertiaForm<TFormData>
}>()
</script>
