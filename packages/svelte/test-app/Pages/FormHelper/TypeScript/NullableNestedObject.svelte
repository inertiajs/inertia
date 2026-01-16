<script lang="ts">
  // This component is used for checking the TypeScript implementation; there is no Playwright test depending on it.
  import { useForm } from '@inertiajs/svelte'

  interface FormData {
    foo: null | {
      bar: string
    }
  }

  const form = useForm<FormData>({
    foo: null,
  })

  console.log(form.errors['foo.bar'])
</script>
