import {
  Directive,
  ElementRef,
  InjectionToken,
  computed,
  effect,
  forwardRef,
  inject,
  input,
  output,
  signal,
  type AfterViewInit,
  type Signal,
} from '@angular/core'
import {
  FormComponentResetSymbol,
  formDataToObject,
  isUrlMethodPair,
  mergeDataIntoQueryString,
  resetFormFields,
  resolveUrlMethodPairComponent,
  type ActiveVisit,
  type CancelToken,
  type ErrorValue,
  type FormComponentOnSubmitCompleteArguments,
  type FormComponentOptimisticCallback,
  type FormComponentOptions,
  type FormComponentProps,
  type FormDataConvertible,
  type FormDataErrors,
  type FormDataKeys,
  type HttpProgressEvent,
  type Method,
  type Page,
  type PendingVisit,
  type UrlMethodPair,
  type VisitCallbacks,
  type VisitOptions,
} from '@inertiajs/core'
import { isEqual } from 'es-toolkit'
import type { NamedInputEvent, ValidationConfig, Validator } from 'laravel-precognition'
import { config } from './config'
import { useForm } from './use-form'

export type FormType<TForm extends object> = { readonly __inertiaFormType?: TForm }

export function createForm<TForm extends object>(): FormType<TForm> {
  return {}
}

export interface InertiaForm<TForm extends object = Record<string, FormDataConvertible>> {
  errors: Signal<FormDataErrors<TForm>>
  hasErrors: Signal<boolean>
  processing: Signal<boolean>
  progress: Signal<HttpProgressEvent | null>
  wasSuccessful: Signal<boolean>
  recentlySuccessful: Signal<boolean>
  isDirty: Signal<boolean>
  validating: Signal<boolean>
  clearErrors<K extends FormDataKeys<TForm>>(...fields: K[]): void
  resetAndClearErrors<K extends FormDataKeys<TForm>>(...fields: K[]): void
  setError: {
    <K extends FormDataKeys<TForm>>(field: K, value: ErrorValue): void
    (errors: FormDataErrors<TForm>): void
  }
  reset<K extends FormDataKeys<TForm>>(...fields: K[]): void
  submit(submitter?: HTMLElement | null): void
  defaults(): void
  getData(submitter?: HTMLElement | null): TForm
  getFormData(submitter?: HTMLElement | null): FormData
  valid<K extends FormDataKeys<TForm>>(field: K): boolean
  invalid<K extends FormDataKeys<TForm>>(field: K): boolean
  validate<K extends FormDataKeys<TForm>>(
    field?: K | NamedInputEvent | ValidationConfig,
    validationConfig?: ValidationConfig,
  ): void
  touch<K extends FormDataKeys<TForm>>(...fields: K[]): void
  touched<K extends FormDataKeys<TForm>>(field?: K): boolean
  validator(): Validator
}

const INERTIA_FORM_CONTEXT = new InjectionToken<InertiaForm>('INERTIA_FORM_CONTEXT')

export function useFormContext<
  TForm extends object = Record<string, FormDataConvertible>,
>(): InertiaForm<TForm> | null {
  return inject(INERTIA_FORM_CONTEXT, { optional: true }) as InertiaForm<TForm> | null
}

@Directive({
  selector: 'form[inertiaForm]',
  exportAs: 'inertiaForm',
  providers: [{ provide: INERTIA_FORM_CONTEXT, useExisting: forwardRef(() => Form) }],
  host: {
    '[attr.action]': 'resolvedAction()',
    '[attr.method]': 'resolvedMethod()',
    '[attr.inert]': 'disableWhileProcessing() && processing() ? "" : null',
    '(change)': 'handleFormUpdate($event)',
    '(input)': 'handleFormUpdate($event)',
    '(reset)': 'handleFormUpdate($event)',
    '(submit)': 'handleSubmit($event)',
  },
})
export class Form<TForm extends object = Record<string, FormDataConvertible>>
  implements AfterViewInit, InertiaForm<TForm>
{
  readonly #element = inject<ElementRef<HTMLFormElement>>(ElementRef)
  readonly #form = useForm<Record<string, string>>({}).withPrecognition(
    () => this.resolvedMethod(),
    () => this.#urlAndData()[0],
  )
  readonly #defaultData = signal(new FormData())
  readonly #isDirty = signal(false)

  readonly formType = input<FormType<TForm> | null>(null)
  readonly action = input<string | UrlMethodPair>('')
  readonly method = input<Method | Uppercase<Method>>('get')
  readonly headers = input<Record<string, string>>({})
  readonly queryStringArrayFormat = input<'brackets' | 'indices'>('brackets')
  readonly errorBag = input<string | null>(null)
  readonly showProgress = input(true)
  readonly transform = input<(data: TForm) => Record<string, FormDataConvertible>>(
    (data) => data as unknown as Record<string, FormDataConvertible>,
  )
  readonly options = input<FormComponentOptions>({})
  readonly resetOnError = input<boolean | FormDataKeys<TForm>[]>(false)
  readonly resetOnSuccess = input<boolean | FormDataKeys<TForm>[]>(false)
  readonly setDefaultsOnSuccess = input(false)
  readonly disableWhileProcessing = input(false)
  readonly invalidateCacheTags = input<string | string[]>([])
  readonly validateFiles = input(false)
  readonly validationTimeout = input(1500)
  readonly optimistic = input<FormComponentOptimisticCallback<Page['props'], TForm> | null>(null)
  readonly withAllErrors = input<boolean | null>(null)
  readonly component = input<string | null>(null)
  readonly instant = input(false)

  readonly onCancelToken = input<VisitCallbacks['onCancelToken'] | null>(null)
  readonly onBefore = input<VisitCallbacks['onBefore'] | null>(null)
  readonly onStart = input<VisitCallbacks['onStart'] | null>(null)
  readonly onProgress = input<VisitCallbacks['onProgress'] | null>(null)
  readonly onFinish = input<VisitCallbacks['onFinish'] | null>(null)
  readonly onCancel = input<VisitCallbacks['onCancel'] | null>(null)
  readonly onSuccess = input<VisitCallbacks['onSuccess'] | null>(null)
  readonly onError = input<VisitCallbacks['onError'] | null>(null)
  readonly onSubmitComplete = input<InertiaFormProps<TForm>['onSubmitComplete'] | null>(null)

  readonly cancelToken = output<CancelToken>()
  readonly before = output<PendingVisit>()
  readonly start = output<PendingVisit>()
  readonly progressEvent = output<HttpProgressEvent | undefined>({ alias: 'progress' })
  readonly finish = output<ActiveVisit>()
  readonly cancel = output<void>()
  readonly success = output<Page>()
  readonly error = output<FormDataErrors<TForm>>()
  readonly submitComplete = output<FormComponentOnSubmitCompleteArguments<TForm>>()

  readonly isDirty = this.#isDirty.asReadonly()
  readonly errors = this.#form.errors as Signal<FormDataErrors<TForm>>
  readonly hasErrors = this.#form.hasErrors
  readonly processing = this.#form.processing
  readonly progress = this.#form.progress
  readonly wasSuccessful = this.#form.wasSuccessful
  readonly recentlySuccessful = this.#form.recentlySuccessful
  readonly validating = this.#form.validating
  readonly resolvedMethod = computed<Method>(() => {
    const action = this.action()
    return isUrlMethodPair(action) ? action.method : (this.method().toLowerCase() as Method)
  })
  readonly resolvedAction = computed(() => {
    const action = this.action()
    return isUrlMethodPair(action) ? action.url : action
  })
  readonly #resolvedComponent = computed(() => {
    const action = this.action()
    return (
      this.component() ?? (this.instant() && isUrlMethodPair(action) ? resolveUrlMethodPairComponent(action) : null)
    )
  })
  #urlAndData(): [string, Record<string, FormDataConvertible>] {
    return mergeDataIntoQueryString(
      this.resolvedMethod(),
      this.resolvedAction(),
      this.getData() as Record<string, FormDataConvertible>,
      this.queryStringArrayFormat(),
    )
  }

  constructor() {
    effect(() => {
      const transform = this.transform()
      this.#form.transform((data) => transform(data as unknown as TForm))
    })
    effect(() => this.#form.setValidationTimeout(this.validationTimeout()))
    effect(() => (this.validateFiles() ? this.#form.validateFiles() : this.#form.withoutFileValidation()))
    effect(() => {
      if (this.withAllErrors() ?? config.get('form.withAllErrors')) this.#form.withAllErrors()
    })
  }

  ngAfterViewInit(): void {
    this.#defaultData.set(this.getFormData())
    this.#form.setData(this.getData() as unknown as Record<string, string>)
    this.#form.setDefaults(this.getData() as unknown as Record<string, string>)
  }

  handleFormUpdate(event: Event): void {
    if (event.type === 'reset' && (event as CustomEvent).detail?.[FormComponentResetSymbol]) {
      event.preventDefault()
    }
    this.#isDirty.set(
      event.type === 'reset'
        ? false
        : !isEqual(this.getData(), formDataToObject(this.#defaultData()) as unknown as TForm),
    )
    this.#form.setData(this.getData() as unknown as Record<string, string>)
  }

  handleSubmit(event: SubmitEvent): void {
    event.preventDefault()
    this.submit(event.submitter as HTMLElement | null)
  }

  getFormData(submitter?: HTMLElement | null): FormData {
    return new FormData(this.#element.nativeElement, submitter)
  }

  getData(submitter?: HTMLElement | null): TForm {
    return formDataToObject(this.getFormData(submitter)) as unknown as TForm
  }

  submit(submitter?: HTMLElement | null): void {
    const data = this.getData(submitter)
    const [url, requestData] = mergeDataIntoQueryString(
      this.resolvedMethod(),
      this.resolvedAction(),
      data as Record<string, FormDataConvertible>,
      this.queryStringArrayFormat(),
    )
    const target = (submitter as HTMLButtonElement | HTMLInputElement | null)?.formTarget
    if (target === '_blank' && this.resolvedMethod() === 'get') {
      window.open(url, '_blank')
      return
    }

    const maybeReset = (option: boolean | FormDataKeys<TForm>[]) => {
      if (option === true) this.reset()
      else if (Array.isArray(option) && option.length > 0) this.reset(...option)
    }
    const visitOptions: VisitOptions = {
      headers: this.headers(),
      queryStringArrayFormat: this.queryStringArrayFormat(),
      errorBag: this.errorBag(),
      showProgress: this.showProgress(),
      invalidateCacheTags: this.invalidateCacheTags(),
      component: this.#resolvedComponent(),
      onCancelToken: (token) => {
        this.onCancelToken()?.(token)
        this.cancelToken.emit(token)
      },
      onBefore: (visit) => {
        const result = this.onBefore()?.(visit)
        this.before.emit(visit)
        return result
      },
      onStart: (visit) => {
        this.onStart()?.(visit)
        this.start.emit(visit)
      },
      onProgress: (progress) => {
        this.onProgress()?.(progress)
        this.progressEvent.emit(progress)
      },
      onFinish: (visit) => {
        this.onFinish()?.(visit)
        this.finish.emit(visit)
      },
      onCancel: () => {
        this.onCancel()?.()
        this.cancel.emit()
      },
      onSuccess: async (page) => {
        await this.onSuccess()?.(page)
        this.success.emit(page)
        const submitComplete = {
          reset: (...fields: FormDataKeys<TForm>[]) => this.reset(...fields),
          defaults: () => this.defaults(),
        }
        this.onSubmitComplete()?.(submitComplete)
        this.submitComplete.emit(submitComplete)
        maybeReset(this.resetOnSuccess())
        if (this.setDefaultsOnSuccess()) this.defaults()
      },
      onError: (errors) => {
        const result = this.onError()?.(errors)
        this.error.emit(errors as FormDataErrors<TForm>)
        maybeReset(this.resetOnError())
        return result
      },
      ...this.options(),
    }
    const optimistic = this.optimistic()
    if (optimistic) visitOptions.optimistic = (props) => optimistic(props, data)

    this.#form.transform(() => this.transform()(requestData as TForm)).submit(this.resolvedMethod(), url, visitOptions)
    this.#form.transform(() => {
      const [, currentData] = this.#urlAndData()
      return this.transform()(currentData as TForm)
    })
  }

  clearErrors<K extends FormDataKeys<TForm>>(...fields: K[]): void {
    this.#form.clearErrors(...(fields as string[]))
  }

  reset<K extends FormDataKeys<TForm>>(...fields: K[]): void {
    resetFormFields(this.#element.nativeElement, this.#defaultData(), fields as string[])
    this.#form.reset(...(fields as string[]))
  }

  resetAndClearErrors<K extends FormDataKeys<TForm>>(...fields: K[]): void {
    this.clearErrors(...fields)
    this.reset(...fields)
  }

  readonly setError = ((fieldOrErrors: FormDataKeys<TForm> | FormDataErrors<TForm>, value?: ErrorValue) => {
    if (typeof fieldOrErrors === 'string') {
      this.#form.setError(fieldOrErrors, value as ErrorValue)
    } else {
      this.#form.setError(fieldOrErrors)
    }
  }) as InertiaForm<TForm>['setError']

  defaults(): void {
    this.#defaultData.set(this.getFormData())
    this.#isDirty.set(false)
    this.#form.setDefaults(this.getData() as unknown as Record<string, string>)
  }

  valid<K extends FormDataKeys<TForm>>(field: K): boolean {
    return this.#form.valid(field)
  }

  invalid<K extends FormDataKeys<TForm>>(field: K): boolean {
    return this.#form.invalid(field)
  }

  validate<K extends FormDataKeys<TForm>>(
    field?: K | NamedInputEvent | ValidationConfig,
    validationConfig?: ValidationConfig,
  ): void {
    const headers = this.headers()
    if (field && typeof field === 'object' && !('target' in field)) {
      this.#form.validate({
        ...field,
        headers: { ...headers, ...field.headers },
      })
      return
    }

    this.#form.validate(field as K | NamedInputEvent | undefined, {
      ...validationConfig,
      headers: { ...headers, ...validationConfig?.headers },
    })
  }

  touch<K extends FormDataKeys<TForm>>(...fields: K[]): void {
    if (fields.length > 0) this.#form.touch(fields as string[])
  }

  touched<K extends FormDataKeys<TForm>>(field?: K): boolean {
    return this.#form.touched(field)
  }

  validator(): Validator {
    return this.#form.validator()
  }
}

export type InertiaFormProps<TForm extends object = Record<string, FormDataConvertible>> = FormComponentProps<TForm>
export type InertiaPrecognitiveForm<TForm extends object = Record<string, FormDataConvertible>> = InertiaForm<TForm>
