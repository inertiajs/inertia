<!-- This component is used for checking the TypeScript implementation; there is no Playwright test depending on it. -->
<script lang="ts">
  import { useHttp } from '@inertiajs/svelte'

  interface UserForm {
    name: string
    email: string
  }

  interface UserResponse {
    id: number
    name: string
  }

  interface OrderResponse {
    orderId: string
    total: number
  }

  async function typedAtCallSite() {
    const form = useHttp<UserForm>({ name: '', email: '' })

    // Default TResponse (unknown)
    const unknown: unknown = await form.post('/users')

    // Override TResponse per method
    const user: UserResponse = await form.post<UserResponse>('/users')
    const order: OrderResponse = await form.get<OrderResponse>('/orders/123')
    const putUser: UserResponse = await form.put<UserResponse>('/users/1')
    const patchUser: UserResponse = await form.patch<UserResponse>('/users/1')
    const deleteResult: { deleted: boolean } = await form.delete<{ deleted: boolean }>('/users/1')

    // Override TResponse on submit
    const submitted: UserResponse = await form.submit<UserResponse>('post', '/users')

    console.log(unknown, user, order, putUser, patchUser, deleteResult, submitted)
  }

  async function typedAtUseHttpLevel() {
    const form = useHttp<UserForm, UserResponse>({ name: '', email: '' })

    // Default TResponse is UserResponse
    const user: UserResponse = await form.post('/users')

    // Override TResponse per method
    const order: OrderResponse = await form.get<OrderResponse>('/orders/123')

    console.log(user, order)
  }

  async function typedOptionsCallbacks() {
    const form = useHttp<UserForm>({ name: '', email: '' })

    await form.post<UserResponse>('/users', {
      onSuccess: (response) => {
        const id: number = response.id
        const name: string = response.name
        console.log(id, name)
      },
    })
  }
</script>

<div>{typedAtCallSite.toString()}{typedAtUseHttpLevel.toString()}{typedOptionsCallbacks.toString()}</div>
