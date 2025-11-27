<script lang="ts">
  // This component is used for checking the TypeScript implementation; there is no Playwright test depending on it.
  import type { FormDataConvertible } from '@inertiajs/core'
  import type { InertiaFormProps } from '@inertiajs/svelte'

  const validation = <T extends Record<string, FormDataConvertible>>(errors: () => InertiaFormProps<T>['errors']) => {
    type Key = keyof ReturnType<typeof errors>

    const filterAndMap = (key: Key) => {
      const err = errors()

      return (Object.keys(err).filter((k) => k.startsWith(key)) as [keyof ReturnType<typeof errors>]).map((k) => err[k])
    }

    const unique = (key: Key) => {
      return filterAndMap(key).filter((error, index, self) => self.indexOf(error) === index)
    }

    return { filterAndMap, unique }
  }
</script>

<button onclick={() => validation(() => ({ name: 'Validation error' }))}> Handle </button>
