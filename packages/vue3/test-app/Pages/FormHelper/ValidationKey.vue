<script setup lang="ts">
import type { FormDataConvertible } from '@inertiajs/core'
import type { InertiaFormProps } from '@inertiajs/vue3'

const validationKey = <T extends Record<string, FormDataConvertible>>(errors: () => InertiaFormProps<T>['errors']) => {
  type Key = keyof ReturnType<typeof errors>

  return {
    filter: (key: Key) => Object.keys(errors()).filter((k) => k.startsWith(key)),
  }
}
</script>
