<script setup lang="ts">
// This component is used for checking the TypeScript implementation; there is no Playwright test depending on it.
import { useForm } from '@inertiajs/vue3'

interface LoginData {
  username: string
  password: string
  remember: boolean
}

const props = defineProps({
  user: {
    type: Object,
    required: false,
    default: null,
  },
})

useForm<LoginData>({
  username: props.user?.username ?? '',
  password: '',
  remember: true,
})
</script>
