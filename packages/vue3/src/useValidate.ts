import { computed, ref } from 'vue'
import type { FormDataConvertible, Method } from '@inertiajs/core'
import type { LiveValidationProps, ValidationEvent } from './types'
import { getLiveValidationProvider, detectInstalledProviders } from './validationProviders'

//

export default function useValidate(options: {
  getData: () => Record<string, FormDataConvertible>
  method: () => Method
  action: () => string
  props: LiveValidationProps
  setErrors: (errors: Record<string, string>) => void
}) {
  const { getData, method, action, props, setErrors } = options

  const validating = ref(false)
  let validator: any = null
  let toSimpleValidationErrors: null | ((errors: any) => Record<string, string>) = null
  let resolveName: null | ((event: Event) => string) = null
  let initPromise: Promise<void> | null = null
  let warnedNoProvider = false
  // Provider-only path: no local debounce/abort; rely on provider's timeout API

  const isGlobalPrecogEnabled = () => typeof props.precognitive === 'object' || props.precognitive === true

  const normalizedValidateOn = computed<Array<ValidationEvent>>(() =>
    Array.isArray(props.validateOn)
      ? (props.validateOn as Array<ValidationEvent>)
      : [props.validateOn as ValidationEvent],
  )

  const shouldValidateField = (target: EventTarget | null) => {
    if (!target || !(target as HTMLElement)) return false
    const el = target as HTMLElement
    // Enabled globally or per-field via attribute
    return isGlobalPrecogEnabled() || el.hasAttribute?.('precognitive') || el.getAttribute?.('data-precognitive') === 'true'
  }

  const ensureInitialized = async () => {
    if (initPromise) return initPromise

    initPromise = (async () => {
      try {
        // Determine provider id
        let providerId = (props.provider || null) as null | string
        if (!providerId) {
          // No explicit provider, rely on already-registered providers
          const installed = await detectInstalledProviders()
          if (installed.length === 1) {
            providerId = installed[0]
          } else if (installed.length > 1) {
            if (!warnedNoProvider) {
              warnedNoProvider = true
              console.warn(
                `[Inertia][Form] multiple live validation providers registered (${installed.join(', ')}). Set the 'provider' prop to choose one.`,
              )
            }
            return
          } else {
            if (isGlobalPrecogEnabled() && !warnedNoProvider) {
              warnedNoProvider = true
              console.warn(
                "[Inertia][Form] precognitive live validation requested but no provider found. Install a live validation provider (e.g. 'laravel-precognition-vue-inertia') or set the 'provider' prop.",
              )
            }
            return
          }
        }

        const adapter = getLiveValidationProvider(providerId)
        if (!adapter) {
          if (isGlobalPrecogEnabled() && !warnedNoProvider) {
            warnedNoProvider = true
            console.warn(
              `[Inertia][Form] provider '${providerId}' is not registered. Register it via registerLiveValidationProvider().`,
            )
          }
          return
        }

        const mod: any = await adapter.import()
        const { createValidator } = mod
        toSimpleValidationErrors = mod.toSimpleValidationErrors ?? ((e: any) => e)
        resolveName = mod.resolveName ?? null

        const actionUrl = action()
        const baseConfig = (typeof props.precognitive === 'object' ? props.precognitive : {}) as Record<string, any>

        validator = createValidator(
          (client: any) => client[method()](actionUrl, getData(), { ...baseConfig, precognitive: true }),
          getData(),
        )
          .on('validatingChanged', () => {
            validating.value = validator.validating()
          })
          .on('errorsChanged', () => {
            // Sync full error bag from validator via adapter callback
            const simple = toSimpleValidationErrors ? toSimpleValidationErrors(validator.errors()) : validator.errors()
            try {
              setErrors(simple as Record<string, string>)
            } catch {}
          })

        if (typeof props.validationTimeout === 'number') {
          validator.setTimeout?.(props.validationTimeout)
        }
      } catch (e) {
        // Provider not installed or failed to load; leave validator as null
        validator = null
        if (isGlobalPrecogEnabled() && !warnedNoProvider) {
          warnedNoProvider = true
          // Dev-friendly warning
          console.warn(
            "[Inertia][Form] precognitive live validation requested but no provider found. Install 'laravel-precognition-vue-inertia' or register a provider.",
          )
        }
      }
    })()

    return initPromise
  }

  const maybeValidate = async (event: Event) => {
    if (!normalizedValidateOn.value.includes(event.type as ValidationEvent)) return
    if (!shouldValidateField(event.target)) return

    // Laravel provider path
    await ensureInitialized()
    if (!validator) return

    try {
      const name = resolveName ? resolveName(event) : ((event.target as HTMLInputElement)?.name || undefined)
      const baseConfig = (typeof props.precognitive === 'object' ? props.precognitive : {}) as Record<string, any>
      if (name) {
        validator.validate(name, (getData() as any)[name], { ...baseConfig, precognitive: true })
      } else {
        validator.validate({ ...baseConfig, precognitive: true })
      }
    } catch {
      // no-op
    }
  }

  const validate = (name?: string) => {
    if (!name && typeof window === 'undefined') return
    // Laravel provider path
    ensureInitialized().then(() => {
      if (!validator) return
      const baseConfig = (typeof props.precognitive === 'object' ? props.precognitive : {}) as Record<string, any>
      if (name) {
        validator.validate(name, (getData() as any)[name], { ...baseConfig, precognitive: true })
      } else {
        validator.validate({ ...baseConfig, precognitive: true })
      }
    })
  }

  const reset = (...fields: string[]) => {
    try {
      validator?.reset?.(...fields)
    } catch {}
  }

  return { validating, maybeValidate, validate, reset, ensureInitialized }
}
