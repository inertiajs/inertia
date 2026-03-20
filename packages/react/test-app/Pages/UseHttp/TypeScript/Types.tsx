// This component is used for checking the TypeScript implementation; there is no Playwright test depending on it.
import { useHttp } from '@inertiajs/react'

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

export default () => {
  const form = useHttp<UserForm>({ name: '', email: '' })
  const typedForm = useHttp<UserForm, UserResponse>({ name: '', email: '' })

  async function typedAtCallSite() {
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
    // Default TResponse is UserResponse
    const user: UserResponse = await typedForm.post('/users')

    // Override TResponse per method
    const order: OrderResponse = await typedForm.get<OrderResponse>('/orders/123')

    console.log(user, order)
  }

  async function typedOptionsCallbacks() {
    await form.post<UserResponse>('/users', {
      onSuccess: (response) => {
        const id: number = response.id
        const name: string = response.name
        console.log(id, name)
      },
    })
  }

  return (
    <div>
      {typedAtCallSite.toString()}
      {typedAtUseHttpLevel.toString()}
      {typedOptionsCallbacks.toString()}
    </div>
  )
}
