import { registerLiveValidationProvider } from '@inertiajs/vue3'

// Very small in-memory validator used only for tests/demo
function createTestValidator(
  requestFactory: (client: any) => Promise<any> | any,
  initialData: Record<string, any>,
) {
  let currentData = { ...initialData }
  let validating = false
  let errors: Record<string, string | string[]> = {}
  let timeoutMs: number | undefined
  let timer: any = null

  const listeners: Record<string, Set<() => void>> = {
    validatingChanged: new Set(),
    errorsChanged: new Set(),
  }

  const emit = (event: 'validatingChanged' | 'errorsChanged') => {
    listeners[event].forEach((cb) => {
      try {
        cb()
      } catch {}
    })
  }

  const runRules = (name?: string) => {
    const next: Record<string, string | string[]> = {}

    const checkName = (val: any) => {
      if (!val || String(val).trim().length < 3) {
        next.name = 'Name must be at least 3 characters.'
      }
    }

    const checkEmail = (val: any) => {
      if (!val || !String(val).includes('@')) {
        next.email = 'Email must contain @.'
      }
    }

    if (name) {
      if (name in currentData) {
        if (name === 'name') checkName(currentData[name])
        if (name === 'email') checkEmail(currentData[name])
      }
      return next
    }

    checkName(currentData.name)
    checkEmail(currentData.email)
    return next
  }

  const schedule = (fn: () => void) => {
    if (timer) clearTimeout(timer)
    if (typeof timeoutMs === 'number' && timeoutMs > 0) {
      timer = setTimeout(fn, timeoutMs)
    } else {
      Promise.resolve().then(fn)
    }
  }

  return {
    on(event: 'validatingChanged' | 'errorsChanged', cb: () => void) {
      listeners[event].add(cb)
      return this
    },
    validating() {
      return validating
    },
    errors() {
      return errors
    },
    setTimeout(ms: number) {
      timeoutMs = ms
    },
    validate(nameOrConfig?: any, value?: any) {
      if (typeof nameOrConfig === 'string') {
        const name = nameOrConfig
        currentData = { ...currentData, [name]: value }
        schedule(() => {
          validating = true
          emit('validatingChanged')
          // Simulate async without making any network calls
          Promise.resolve().then(() => {
            errors = runRules(name)
            validating = false
            emit('errorsChanged')
            emit('validatingChanged')
          })
        })
      } else {
        schedule(() => {
          validating = true
          emit('validatingChanged')
          Promise.resolve().then(() => {
            errors = runRules()
            validating = false
            emit('errorsChanged')
            emit('validatingChanged')
          })
        })
      }
      return this
    },
    reset(...fields: string[]) {
      if (!fields.length) {
        errors = {}
      } else {
        for (const f of fields) delete errors[f]
      }
      emit('errorsChanged')
    },
  }
}

function toSimpleValidationErrors(e: Record<string, string | string[]>) {
  const out: Record<string, string> = {}
  for (const k of Object.keys(e)) {
    const v = e[k]
    out[k] = Array.isArray(v) ? (v[0] ?? '') : (v ?? '')
  }
  return out
}

function resolveName(event: Event): string | undefined {
  const target = event?.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null
  return target?.name
}

// Register once on import, except when the test route requires no provider
const shouldRegister =
  typeof window === 'undefined' || !window.location.pathname.startsWith('/form-component/live-validation-no-provider')

if (shouldRegister) {
  registerLiveValidationProvider({
    id: 'mock',
    import: async () => ({ createValidator: createTestValidator, toSimpleValidationErrors, resolveName }),
  })
}
