<script lang="ts">
  import { useHttp } from '@inertiajs/svelte'

  interface UserResponse {
    success: boolean
    id: number
    user: {
      name: string
      email: string
    }
  }

  const form = useHttp<{ name: string; email: string }, UserResponse>('post', '/api/users', {
    name: '',
    email: '',
  })

  let submitResult: UserResponse | null = $state(null)
  let submitWithMethodResult: UserResponse | null = $state(null)
  let submitWithWayfinderResult: UserResponse | null = $state(null)

  const performSubmit = async () => {
    try {
      const result = await form.submit()
      submitResult = result
    } catch (e) {
      console.error('Submit failed:', e)
    }
  }

  const performSubmitWithMethod = async () => {
    try {
      const result = await form.submit('put', '/api/users/99')
      submitWithMethodResult = result
    } catch (e) {
      console.error('Submit with method failed:', e)
    }
  }

  const performSubmitWithWayfinder = async () => {
    try {
      const result = await form.submit({ method: 'patch', url: '/api/users/88' })
      submitWithWayfinderResult = result
    } catch (e) {
      console.error('Submit with wayfinder failed:', e)
    }
  }
</script>

<div>
  <h1>useHttp Submit Test</h1>

  <label>
    Name
    <input type="text" id="submit-name" bind:value={form.name} />
  </label>
  <label>
    Email
    <input type="email" id="submit-email" bind:value={form.email} />
  </label>

  <!-- Submit using Wayfinder endpoint -->
  <section id="submit-test">
    <h2>Submit (uses Wayfinder endpoint)</h2>
    <button onclick={performSubmit} id="submit-button">Submit</button>
    {#if form.processing}
      <div id="submit-processing">Processing...</div>
    {/if}
    {#if submitResult}
      <div id="submit-result">
        Submit Success - ID: {submitResult.id}, Name: {submitResult.user.name}, Email: {submitResult.user.email}
      </div>
    {/if}
  </section>

  <!-- Submit with explicit method and URL -->
  <section id="submit-method-test">
    <h2>Submit with method and URL</h2>
    <button onclick={performSubmitWithMethod} id="submit-method-button">Submit (PUT /api/users/99)</button>
    {#if submitWithMethodResult}
      <div id="submit-method-result">
        PUT Success - ID: {submitWithMethodResult.id}, Name: {submitWithMethodResult.user.name}, Email: {submitWithMethodResult
          .user.email}
      </div>
    {/if}
  </section>

  <!-- Submit with UrlMethodPair object -->
  <section id="submit-wayfinder-test">
    <h2>Submit with UrlMethodPair</h2>
    <button onclick={performSubmitWithWayfinder} id="submit-wayfinder-button">Submit (PATCH /api/users/88)</button>
    {#if submitWithWayfinderResult}
      <div id="submit-wayfinder-result">
        PATCH Success - ID: {submitWithWayfinderResult.id}, Name: {submitWithWayfinderResult.user.name}, Email: {submitWithWayfinderResult
          .user.email}
      </div>
    {/if}
  </section>
</div>
