import { Component, afterNextRender, signal } from '@angular/core'
import { Link, useHttp, type ResolvedComponent, type UseHttpProps } from '@inertiajs/angular'

type UserResponse = {
  success: boolean
  id: number
  user: { name: string; email: string }
}

const inputValue = (event: Event): string => (event.target as HTMLInputElement).value

@Component({
  selector: 'test-use-http-index',
  template: `
    <h1>useHttp Test Page</h1>
    <section id="get-test">
      <input id="search-query" [value]="search.data().query" (input)="search.setData('query', value($event))" />
      <button id="search-button" type="button" (click)="performSearch()">Search</button>
      @if (search.processing()) {
        <div id="search-processing">Searching...</div>
      }
      @if (lastGetResponse(); as result) {
        <div id="search-result">
          Items: {{ result.items.join(', ') }}<br />Total: {{ result.total }}<br />Query: {{ result.query }}
        </div>
      }
      @if (search.response(); as response) {
        <div id="search-response">Response stored: {{ response.total }} items</div>
      }
    </section>

    <section id="post-test">
      <input id="create-name" [value]="createUser.data().name" (input)="createUser.setData('name', value($event))" />
      <input
        id="create-email"
        type="email"
        [value]="createUser.data().email"
        (input)="createUser.setData('email', value($event))"
      />
      <button id="create-button" type="button" (click)="performCreate()">Create User</button>
      @if (createUser.processing()) {
        <div id="create-processing">Creating...</div>
      }
      @if (createUser.wasSuccessful()) {
        <div id="create-success">User created successfully!</div>
      }
      @if (createUser.recentlySuccessful()) {
        <div id="create-recently-successful">Recently successful!</div>
      }
      @if (lastPostResponse(); as result) {
        <div id="create-result">
          Created user ID: {{ result.id }}<br />Name: {{ result.user.name }}<br />Email: {{ result.user.email }}
        </div>
      }
      @if (createUser.isDirty()) {
        <div id="create-dirty">Form has unsaved changes</div>
      }
    </section>

    <section id="validation-test">
      <input
        id="validate-name"
        [value]="validateUser.data().name"
        (input)="validateUser.setData('name', value($event))"
      />
      @if (validateUser.errors().name; as error) {
        <span id="validate-name-error">{{ error }}</span>
      }
      <input
        id="validate-email"
        type="email"
        [value]="validateUser.data().email"
        (input)="validateUser.setData('email', value($event))"
      />
      @if (validateUser.errors().email; as error) {
        <span id="validate-email-error">{{ error }}</span>
      }
      <button id="validate-button" type="button" (click)="performValidation()">Validate</button>
      @if (validateUser.hasErrors()) {
        <div id="validate-has-errors">Form has errors</div>
      }
      @if (validationOnErrorMessage()) {
        <div id="validate-on-error">{{ validationOnErrorMessage() }}</div>
      }
      @if (validationExceptionMessage()) {
        <div id="validate-exception">{{ validationExceptionMessage() }}</div>
      }
      <button id="clear-errors-button" type="button" (click)="validateUser.clearErrors()">Clear Errors</button>
      <button id="clear-name-error-button" type="button" (click)="validateUser.clearErrors('name')">
        Clear Name Error
      </button>
      <button id="set-name-error-button" type="button" (click)="validateUser.setError('name', 'Manual name error')">
        Set Name Error
      </button>
      <button id="set-multiple-errors-button" type="button" (click)="setMultipleErrors()">Set Multiple Errors</button>
    </section>

    <section id="delete-test">
      <input id="delete-user-id" type="number" [value]="deleteUser.data().userId" (input)="setUserId($event)" />
      <button id="delete-button" type="button" (click)="performDelete()">Delete User</button>
      @if (lastDeleteResponse(); as result) {
        <div id="delete-result">Deleted user ID: {{ result.deleted }}</div>
      }
    </section>

    <section id="cancel-test">
      <button id="slow-request-button" type="button" (click)="performSlowRequest()">Start Slow Request</button>
      <button id="cancel-button" type="button" (click)="slowRequest.cancel()">Cancel Request</button>
      @if (slowRequest.processing()) {
        <div id="slow-processing">Request in progress...</div>
      }
      @if (cancelledMessage()) {
        <div id="cancelled-message">{{ cancelledMessage() }}</div>
      }
    </section>

    <section id="error-test">
      <button id="error-button" type="button" (click)="triggerServerError()">Trigger Server Error</button>
      @if (errorMessage()) {
        <div id="error-message">{{ errorMessage() }}</div>
      }
    </section>
    <section id="http-exception-test">
      <button id="http-exception-button" type="button" (click)="triggerHttpException()">Trigger HTTP Exception</button>
      @if (httpExceptionStatus()) {
        <div id="http-exception-status">Status: {{ httpExceptionStatus() }}</div>
      }
      @if (httpExceptionBody()) {
        <div id="http-exception-body">Body: {{ httpExceptionBody() }}</div>
      }
    </section>
    <section id="network-error-test">
      <button id="network-error-button" type="button" (click)="triggerNetworkError()">Trigger Network Error</button>
      @if (networkErrorMessage()) {
        <div id="network-error-message">{{ networkErrorMessage() }}</div>
      }
    </section>
    <section id="reset-test">
      <button id="reset-button" type="button" (click)="createUser.reset()">Reset Form</button>
      <button id="defaults-button" type="button" (click)="createUser.setDefaults()">Set Current as Defaults</button>
      <div id="reset-name-value">Current name: {{ createUser.data().name }}</div>
    </section>
  `,
})
class UseHttpIndex {
  readonly search = useHttp<{ query: string }, { items: string[]; total: number; query: string | null }>({ query: '' })
  readonly createUser = useHttp<{ name: string; email: string }, UserResponse>({ name: '', email: '' })
  readonly validateUser = useHttp<{ name: string; email: string }, { success: boolean }>({ name: '', email: '' })
  readonly deleteUser = useHttp<{ userId: number }, { success: boolean; deleted: number }>({ userId: 0 })
  readonly slowRequest = useHttp<Record<string, never>, { result: string }>({})
  readonly errorHttp = useHttp<Record<string, never>, never>({})
  readonly httpExceptionHttp = useHttp<Record<string, never>, never>({})
  readonly networkErrorHttp = useHttp<Record<string, never>, never>({})
  readonly lastGetResponse = signal<{ items: string[]; total: number; query: string | null } | null>(null)
  readonly lastPostResponse = signal<UserResponse | null>(null)
  readonly lastDeleteResponse = signal<{ success: boolean; deleted: number } | null>(null)
  readonly cancelledMessage = signal('')
  readonly errorMessage = signal('')
  readonly httpExceptionStatus = signal<number | null>(null)
  readonly httpExceptionBody = signal('')
  readonly networkErrorMessage = signal('')
  readonly validationOnErrorMessage = signal('')
  readonly validationExceptionMessage = signal('')
  readonly value = inputValue

  async performSearch(): Promise<void> {
    try {
      this.lastGetResponse.set(await this.search.get('/api/data'))
    } catch {
      /* displayed by the fixture */
    }
  }

  async performCreate(): Promise<void> {
    try {
      this.lastPostResponse.set(await this.createUser.post('/api/users'))
    } catch {
      /* displayed by the fixture */
    }
  }

  async performValidation(): Promise<void> {
    this.validationOnErrorMessage.set('')
    this.validationExceptionMessage.set('')
    try {
      await this.validateUser.post('/api/validate', {
        onError: () => this.validationOnErrorMessage.set('onError called'),
      })
    } catch (error) {
      this.validationExceptionMessage.set(error instanceof Error ? error.message : 'Unknown validation exception')
    }
  }

  setMultipleErrors(): void {
    this.validateUser.setError({ name: 'Multi name error', email: 'Multi email error' })
  }

  setUserId(event: Event): void {
    this.deleteUser.setData('userId', Number.parseInt(inputValue(event), 10) || 0)
  }

  async performDelete(): Promise<void> {
    try {
      this.lastDeleteResponse.set(await this.deleteUser.delete(`/api/users/${this.deleteUser.data().userId}`))
    } catch {
      /* displayed by the fixture */
    }
  }

  async performSlowRequest(): Promise<void> {
    this.cancelledMessage.set('')
    try {
      await this.slowRequest.get('/api/slow')
    } catch (error) {
      if (error instanceof Error && (error.name === 'HttpCancelledError' || error.message.includes('abort'))) {
        this.cancelledMessage.set('Request was cancelled')
      }
    }
  }

  async triggerServerError(): Promise<void> {
    this.errorMessage.set('')
    try {
      await this.errorHttp.post('/api/error')
    } catch (error) {
      if (
        error &&
        typeof error === 'object' &&
        'response' in error &&
        (error as { response?: { status?: number } }).response?.status === 500
      ) {
        this.errorMessage.set('Server returned 500 error')
      }
    }
  }

  async triggerHttpException(): Promise<void> {
    this.httpExceptionStatus.set(null)
    this.httpExceptionBody.set('')
    try {
      await this.httpExceptionHttp.post('/api/error', {
        onHttpException: (response) => {
          this.httpExceptionStatus.set(response.status)
          this.httpExceptionBody.set(response.data)
        },
      })
    } catch {
      /* expected */
    }
  }

  async triggerNetworkError(): Promise<void> {
    this.networkErrorMessage.set('')
    try {
      await this.networkErrorHttp.get('/api/network-error-test', {
        onNetworkError: (error) => this.networkErrorMessage.set(error.message || 'Network error occurred'),
      })
    } catch {
      /* expected */
    }
  }
}

@Component({
  selector: 'test-use-http-methods',
  template: `
    <input id="put-name" [value]="form.data().name" (input)="form.setData('name', value($event))" />
    <input id="put-email" [value]="form.data().email" (input)="form.setData('email', value($event))" />
    <button id="put-button" type="button" (click)="put()">Update User (PUT)</button>
    @if (form.processing()) {
      <div id="put-processing">Updating...</div>
    }
    @if (putResult(); as result) {
      <div id="put-result">
        PUT Success - ID: {{ result.id }}, Name: {{ result.user.name }}, Email: {{ result.user.email }}
      </div>
    }
    <button id="patch-button" type="button" (click)="patch()">Update User (PATCH)</button>
    @if (patchResult(); as result) {
      <div id="patch-result">
        PATCH Success - ID: {{ result.id }}, Name: {{ result.user.name }}, Email: {{ result.user.email }}
      </div>
    }
  `,
})
class UseHttpMethods {
  readonly form = useHttp<{ name: string; email: string }, UserResponse>({ name: '', email: '' })
  readonly putResult = signal<UserResponse | null>(null)
  readonly patchResult = signal<UserResponse | null>(null)
  readonly value = inputValue
  async put(): Promise<void> {
    this.putResult.set(await this.form.put('/api/users/1'))
  }
  async patch(): Promise<void> {
    this.patchResult.set(await this.form.patch('/api/users/1'))
  }
}

@Component({
  selector: 'test-use-http-transform',
  template: `
    <input id="transform-name" [value]="form.data().name" (input)="form.setData('name', value($event))" />
    <input id="transform-email" [value]="form.data().email" (input)="form.setData('email', value($event))" />
    <button id="transform-button" type="button" (click)="submit()">Submit with Transform</button>
    @if (result(); as response) {
      <div id="transform-result">
        Transformed Name: {{ response.received.transformed_name }}<br />Transformed Email:
        {{ response.received.transformed_email }}<br />Original Name: {{ response.received.original_name }}
      </div>
    }
  `,
})
class UseHttpTransform {
  readonly form = useHttp<
    { name: string; email: string },
    { received: { transformed_name: string; transformed_email: string; original_name: string } }
  >({ name: '', email: '' })
  readonly result = signal<{
    received: { transformed_name: string; transformed_email: string; original_name: string }
  } | null>(null)
  readonly value = inputValue
  async submit(): Promise<void> {
    this.form.transform((data) => ({
      transformed_name: data.name.toUpperCase(),
      transformed_email: data.email.toLowerCase(),
      original_name: data.name,
    }))
    this.result.set(await this.form.post('/api/transform'))
  }
}

type UploadResponse = { files: Array<{ originalname: string }>; fileCount: number; formData: Record<string, string> }

@Component({
  selector: 'test-use-http-file-upload',
  template: `
    <input
      id="upload-description"
      [value]="form.data().description"
      (input)="form.setData('description', value($event))"
    />
    <input type="file" id="upload-file" (change)="singleFile($event)" />
    <input type="file" id="upload-files" multiple (change)="multipleFiles($event)" />
    <button id="upload-button" type="button" (click)="upload()">Upload</button>
    @if (form.processing()) {
      <div id="upload-processing">Uploading...</div>
    }
    @if (progress() !== null) {
      <div id="upload-progress">Progress: {{ progress() }}%</div>
    }
    @if (result(); as response) {
      <div id="upload-result">
        Upload Success - Files: {{ response.fileCount }}
        @if (response.files.length) {
          <span>- {{ names(response) }}</span>
        }
      </div>
    }
  `,
})
class UseHttpFileUpload {
  readonly form = useHttp<{ description: string; file?: File; files?: File[] }, UploadResponse>({
    description: '',
    file: undefined,
    files: undefined,
  })
  readonly result = signal<UploadResponse | null>(null)
  readonly progress = signal<number | null>(null)
  readonly value = inputValue
  singleFile(event: Event): void {
    this.form.setData('file', (event.target as HTMLInputElement).files?.[0])
  }
  multipleFiles(event: Event): void {
    this.form.setData('files', Array.from((event.target as HTMLInputElement).files ?? []))
  }
  names(response: UploadResponse): string {
    return response.files.map((file) => file.originalname).join(', ')
  }
  async upload(): Promise<void> {
    this.progress.set(null)
    this.result.set(
      await this.form.post('/api/upload', { onProgress: (progress) => this.progress.set(progress.percentage ?? null) }),
    )
  }
}

@Component({
  selector: 'test-use-http-headers',
  template: `
    <button id="headers-button" type="button" (click)="submit()">Send with Custom Headers</button>
    @if (result(); as response) {
      <div id="headers-result">
        Custom Header Received: {{ response.headers['x-custom-header'] || 'none' }}<br />Another Header:
        {{ response.headers['x-another-header'] || 'none' }}<br />Content-Type:
        {{ response.headers['content-type'] || 'none' }}
      </div>
    }
  `,
})
class UseHttpHeaders {
  readonly form = useHttp<{ data: string }, { headers: Record<string, string>; method: string }>({ data: 'test' })
  readonly result = signal<{ headers: Record<string, string>; method: string } | null>(null)
  async submit(): Promise<void> {
    this.result.set(
      await this.form.post('/api/headers', {
        headers: { 'X-Custom-Header': 'custom-value', 'X-Another-Header': 'another-value' },
      }),
    )
  }
}

@Component({
  selector: 'test-use-http-lifecycle',
  template: `
    <input
      id="lifecycle-value"
      [value]="successForm.data().value"
      (input)="successForm.setData('value', value($event))"
    />
    <button id="lifecycle-button" type="button" (click)="success()">Test Lifecycle (Success)</button>
    <button id="lifecycle-error-button" type="button" (click)="error()">Test Lifecycle (Error)</button>
    <button id="lifecycle-cancel-button" type="button" (click)="cancel()">Test onBefore Cancel</button>
    <div id="lifecycle-events">Events: {{ successEvents().join(', ') }}</div>
    <div id="lifecycle-error-events">Error Events: {{ errorEvents().join(', ') }}</div>
    @if (cancelled()) {
      <div id="lifecycle-cancelled">onBefore returned false - request cancelled</div>
    }
    @if (cancelForm.processing()) {
      <div id="lifecycle-cancel-processing">Processing...</div>
    }
  `,
})
class UseHttpLifecycle {
  readonly successForm = useHttp<{ value: string }, unknown>({ value: '' })
  readonly errorForm = useHttp<{ value: string }, unknown>({ value: '' })
  readonly cancelForm = useHttp<{ value: string }, unknown>({ value: '' })
  readonly successEvents = signal<string[]>([])
  readonly errorEvents = signal<string[]>([])
  readonly cancelled = signal(false)
  readonly value = inputValue

  async success(): Promise<void> {
    const events: string[] = []
    const add = (name: string) => {
      events.push(name)
      this.successEvents.set([...events])
    }
    this.successEvents.set([])
    try {
      await this.successForm.post('/api/lifecycle', {
        onBefore: () => add('onBefore'),
        onStart: () => add('onStart'),
        onSuccess: () => add('onSuccess'),
        onError: () => add('onError'),
        onFinish: () => add('onFinish'),
      })
    } catch {
      /* fixture state is observable */
    }
  }

  async error(): Promise<void> {
    const events: string[] = []
    const add = (name: string) => {
      events.push(name)
      this.errorEvents.set([...events])
    }
    this.errorEvents.set([])
    try {
      await this.errorForm.post('/api/lifecycle-error', {
        onBefore: () => add('onBefore'),
        onStart: () => add('onStart'),
        onSuccess: () => add('onSuccess'),
        onError: () => add('onError'),
        onFinish: () => add('onFinish'),
      })
    } catch {
      /* expected */
    }
  }

  async cancel(): Promise<void> {
    this.cancelled.set(false)
    try {
      await this.cancelForm.post('/api/lifecycle', {
        onBefore: () => {
          this.cancelled.set(true)
          return false
        },
      })
    } catch {
      /* expected */
    }
  }
}

type NestedForm = { user: { name: string; address: { city: string; zip: string } }; tags: string[] }

@Component({
  selector: 'test-use-http-nested',
  template: `
    <input id="nested-user-name" [value]="form.data().user.name" (input)="setName($event)" />
    <input id="nested-city" [value]="form.data().user.address.city" (input)="setAddress('city', $event)" />
    <input id="nested-zip" [value]="form.data().user.address.zip" (input)="setAddress('zip', $event)" />
    <input id="nested-tags" (input)="setTags($event)" />
    <button id="nested-button" type="button" (click)="submit()">Submit Nested Data</button>
    @if (result(); as response) {
      <div id="nested-result">Received: {{ stringify(response.received) }}</div>
    }
  `,
})
class UseHttpNestedData {
  readonly form = useHttp<NestedForm, { received: Record<string, unknown> }>({
    user: { name: '', address: { city: '', zip: '' } },
    tags: [],
  })
  readonly result = signal<{ received: Record<string, unknown> } | null>(null)
  readonly stringify = JSON.stringify
  setName(event: Event): void {
    this.form.setData('user', { ...this.form.data().user, name: inputValue(event) })
  }
  setAddress(key: 'city' | 'zip', event: Event): void {
    this.form.setData('user', {
      ...this.form.data().user,
      address: { ...this.form.data().user.address, [key]: inputValue(event) },
    })
  }
  setTags(event: Event): void {
    this.form.setData(
      'tags',
      inputValue(event)
        .split(',')
        .map((tag) => tag.trim()),
    )
  }
  async submit(): Promise<void> {
    this.result.set(await this.form.post('/api/nested'))
  }
}

type MixedForm = { title: string; user: { name: string; email: string }; tags: string[]; document?: File }
type MixedResponse = { files: Array<{ originalname: string }>; fileCount: number; formData: Record<string, unknown> }

@Component({
  selector: 'test-use-http-mixed',
  template: `
    <input id="mixed-title" [value]="form.data().title" (input)="form.setData('title', value($event))" />
    <input id="mixed-user-name" [value]="form.data().user.name" (input)="setUser('name', $event)" />
    <input id="mixed-user-email" [value]="form.data().user.email" (input)="setUser('email', $event)" />
    <input id="mixed-tags" (input)="form.setData('tags', tags($event))" />
    <input type="file" id="mixed-document" (change)="file($event)" />
    <button id="mixed-button" type="button" (click)="submit()">Submit Mixed Content</button>
    @if (form.processing()) {
      <div id="mixed-processing">Submitting...</div>
    }
    @if (result(); as response) {
      <div id="mixed-result">
        Files: {{ response.fileCount }}
        @if (response.files.length) {
          <span>({{ names(response) }})</span>
        }
        <br />Form Data: {{ stringify(response.formData) }}
      </div>
    }
  `,
})
class UseHttpMixedContent {
  readonly form = useHttp<MixedForm, MixedResponse>({
    title: '',
    user: { name: '', email: '' },
    tags: [],
    document: undefined,
  })
  readonly result = signal<MixedResponse | null>(null)
  readonly value = inputValue
  readonly stringify = JSON.stringify
  setUser(key: 'name' | 'email', event: Event): void {
    this.form.setData('user', { ...this.form.data().user, [key]: inputValue(event) })
  }
  tags(event: Event): string[] {
    return inputValue(event)
      .split(',')
      .map((tag) => tag.trim())
  }
  file(event: Event): void {
    this.form.setData('document', (event.target as HTMLInputElement).files?.[0])
  }
  names(response: MixedResponse): string {
    return response.files.map((file) => file.originalname).join(', ')
  }
  async submit(): Promise<void> {
    this.result.set(await this.form.post('/api/mixed'))
  }
}

@Component({
  selector: 'test-use-http-remember',
  imports: [Link],
  template: `
    <input id="name" [value]="form.data().name" (input)="form.setData('name', value($event))" />
    <input id="email" [value]="form.data().email" (input)="form.setData('email', value($event))" />
    <div id="current-values">Name: {{ form.data().name }}, Email: {{ form.data().email }}</div>
    <div id="is-dirty">isDirty: {{ form.isDirty() }}</div>
    <a inertiaLink href="/dump/get" id="navigate-away">Navigate away</a>
  `,
})
class UseHttpRemember {
  readonly form = useHttp('useHttpRemember', { name: 'initial', email: '' })
  readonly value = inputValue
}

@Component({
  selector: 'test-use-http-submit',
  template: `
    <input id="submit-name" [value]="form.data().name" (input)="form.setData('name', value($event))" />
    <input id="submit-email" [value]="form.data().email" (input)="form.setData('email', value($event))" />
    <button id="submit-button" type="button" (click)="submit()">Submit</button>
    @if (form.processing()) {
      <div id="submit-processing">Processing...</div>
    }
    @if (result(); as response) {
      <div id="submit-result">
        Submit Success - ID: {{ response.id }}, Name: {{ response.user.name }}, Email: {{ response.user.email }}
      </div>
    }
    <button id="submit-method-button" type="button" (click)="submitMethod()">Submit (PUT /api/users/99)</button>
    @if (methodResult(); as response) {
      <div id="submit-method-result">
        PUT Success - ID: {{ response.id }}, Name: {{ response.user.name }}, Email: {{ response.user.email }}
      </div>
    }
    <button id="submit-wayfinder-button" type="button" (click)="submitWayfinder()">Submit (PATCH /api/users/88)</button>
    @if (wayfinderResult(); as response) {
      <div id="submit-wayfinder-result">
        PATCH Success - ID: {{ response.id }}, Name: {{ response.user.name }}, Email: {{ response.user.email }}
      </div>
    }
  `,
})
class UseHttpSubmit {
  readonly form = useHttp<{ name: string; email: string }, UserResponse>('post', '/api/users', { name: '', email: '' })
  readonly result = signal<UserResponse | null>(null)
  readonly methodResult = signal<UserResponse | null>(null)
  readonly wayfinderResult = signal<UserResponse | null>(null)
  readonly value = inputValue
  async submit(): Promise<void> {
    this.result.set(await this.form.submit())
  }
  async submitMethod(): Promise<void> {
    this.methodResult.set(await this.form.submit('put', '/api/users/99'))
  }
  async submitWayfinder(): Promise<void> {
    this.wayfinderResult.set(await this.form.submit({ method: 'patch', url: '/api/users/88' }))
  }
}

@Component({
  selector: 'test-use-http-optimistic',
  template: `
    <input id="optimistic-name" [value]="form.data().name" (input)="form.setData('name', value($event))" />
    <button id="optimistic-button" type="button" (click)="submit(form)">Submit</button>
    <div id="optimistic-current-name">Name: {{ form.data().name }}</div>
    @if (form.processing()) {
      <div id="optimistic-processing">Processing...</div>
    }
    @if (form.wasSuccessful()) {
      <div id="optimistic-success">Success!</div>
    }
    <input
      id="optimistic-inline-name"
      [value]="inlineForm.data().name"
      (input)="inlineForm.setData('name', value($event))"
    />
    <button id="optimistic-inline-button" type="button" (click)="submitInline()">Submit</button>
    <div id="optimistic-inline-current-name">Name: {{ inlineForm.data().name }}</div>
    @if (inlineForm.processing()) {
      <div id="optimistic-inline-processing">Processing...</div>
    }
    @if (inlineForm.wasSuccessful()) {
      <div id="optimistic-inline-success">Success!</div>
    }
  `,
})
class UseHttpOptimistic {
  readonly form = useHttp<{ name: string }, unknown>({ name: '' })
  readonly inlineForm = useHttp<{ name: string }, unknown>({ name: '' })
  readonly value = inputValue
  async submit(form: UseHttpProps<{ name: string }, unknown>): Promise<void> {
    await form.optimistic((data) => ({ name: `${data.name} (saving...)` })).post('/api/optimistic-todo')
  }
  async submitInline(): Promise<void> {
    await this.inlineForm.post('/api/optimistic-todo', { optimistic: (data) => ({ name: `${data.name} (saving...)` }) })
  }
}

@Component({
  selector: 'test-use-http-all-errors',
  template: `
    <button id="simple-submit" type="button" (click)="submit(simple)">Submit</button>
    @if (simple.hasErrors()) {
      <div id="simple-has-errors">Has errors</div>
    }
    @if (simple.errors().name; as error) {
      <div id="simple-name-error">Name: {{ error }}</div>
    }
    @if (simple.errors().email; as error) {
      <div id="simple-email-error">Email: {{ error }}</div>
    }
    <button id="all-submit" type="button" (click)="submit(all)">Submit</button>
    @if (all.hasErrors()) {
      <div id="all-has-errors">Has errors</div>
    }
    @if (all.errors().name; as error) {
      <div id="all-name-error">Name: {{ error }}</div>
    }
    @if (all.errors().email; as error) {
      <div id="all-email-error">Email: {{ error }}</div>
    }
  `,
})
class UseHttpAllErrors {
  readonly simple = useHttp<{ name: string; email: string }, unknown>({ name: '', email: '' })
  readonly all = useHttp<{ name: string; email: string }, unknown>({ name: '', email: '' }).withAllErrors()
  async submit(form: UseHttpProps<{ name: string; email: string }, unknown>): Promise<void> {
    await form.post('/api/validate-multiple')
  }
}

@Component({
  selector: 'test-use-http-stable',
  template:
    '<div id="render-count">Render count: 1</div>@if (form.recentlySuccessful()) { <div id="recently-successful">Recently successful</div> }@if (result()) { <div id="result">Items: {{ result()!.items.join(", ") }}</div> }',
})
class UseHttpStableReference {
  readonly form = useHttp<{ query: string }, { items: string[] }>({ query: '' })
  readonly result = signal<{ items: string[] } | null>(null)
  constructor() {
    afterNextRender(() => void this.form.get('/api/data').then((result) => this.result.set(result)))
  }
}

@Component({
  selector: 'test-use-http-no-content',
  template: `
    <input id="no-content-name" [value]="form.data().name" (input)="form.setData('name', value($event))" />
    <button id="no-content-button" type="button" (click)="submit()">Submit</button>
    @if (form.processing()) {
      <div id="no-content-processing">Processing...</div>
    }
    @if (form.wasSuccessful()) {
      <div id="no-content-success">Success</div>
    }
    <div id="no-content-response">Response: {{ response() }}</div>
  `,
})
class UseHttpNoContent {
  readonly form = useHttp({ name: '' })
  readonly response = signal('none')
  readonly value = inputValue
  async submit(): Promise<void> {
    try {
      this.response.set(JSON.stringify(await this.form.post('/api/no-content')))
    } catch {
      this.response.set('error')
    }
  }
}

export const useHttpPages: Record<string, ResolvedComponent> = {
  'UseHttp/Index': UseHttpIndex,
  'UseHttp/Methods': UseHttpMethods,
  'UseHttp/Transform': UseHttpTransform,
  'UseHttp/FileUpload': UseHttpFileUpload,
  'UseHttp/Headers': UseHttpHeaders,
  'UseHttp/Lifecycle': UseHttpLifecycle,
  'UseHttp/NestedData': UseHttpNestedData,
  'UseHttp/MixedContent': UseHttpMixedContent,
  'UseHttp/Remember': UseHttpRemember,
  'UseHttp/Submit': UseHttpSubmit,
  'UseHttp/Optimistic': UseHttpOptimistic,
  'UseHttp/WithAllErrors': UseHttpAllErrors,
  'UseHttp/StableReference': UseHttpStableReference,
  'UseHttp/NoContent': UseHttpNoContent,
}
