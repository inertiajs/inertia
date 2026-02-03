import { FormDataType, HttpCancelledError, UseHttpSubmitOptions } from '@inertiajs/core'
import { cloneDeep } from 'lodash-es'
import { computed, toRaw } from 'vue'
import useHttp from './useHttp'

export interface UseOptimisticOptions<TResponse = unknown> {
  headers?: Record<string, string>
  onBefore?: () => boolean | void
  onSuccess?: (response: TResponse) => void
  onError?: (error: unknown) => void
  onCancel?: () => void
  onFinish?: () => void
}

export type OptimisticData<T> = Partial<T> | ((current: T) => T)

export interface UseOptimisticReturn<T extends object> {
  value: T
  processing: boolean
  get<TResponse = unknown>(
    url: string,
    data: OptimisticData<T>,
    options?: UseOptimisticOptions<TResponse>,
  ): Promise<TResponse>
  post<TResponse = unknown>(
    url: string,
    data: OptimisticData<T>,
    options?: UseOptimisticOptions<TResponse>,
  ): Promise<TResponse>
  put<TResponse = unknown>(
    url: string,
    data: OptimisticData<T>,
    options?: UseOptimisticOptions<TResponse>,
  ): Promise<TResponse>
  patch<TResponse = unknown>(
    url: string,
    data: OptimisticData<T>,
    options?: UseOptimisticOptions<TResponse>,
  ): Promise<TResponse>
  delete<TResponse = unknown>(
    url: string,
    data?: OptimisticData<T>,
    options?: UseOptimisticOptions<TResponse>,
  ): Promise<TResponse>
  cancel(): void
  reset(): void
}

export default function useOptimistic<T extends FormDataType<T>>(initialValue: T): UseOptimisticReturn<T> {
  const defaults = cloneDeep(initialValue)
  const form = useHttp<T, unknown>(cloneDeep(initialValue))

  const wrapMethod = (method: 'get' | 'post' | 'put' | 'patch' | 'delete') => {
    return <TResponse = unknown>(
      url: string,
      data: OptimisticData<T> | undefined,
      options?: UseOptimisticOptions<TResponse>,
    ): Promise<TResponse> => {
      const optimistic = (current: T): Partial<T> => {
        if (data === undefined) {
          return {}
        }

        if (typeof data === 'function') {
          return data(current)
        }

        return data
      }

      const httpOptions: UseHttpSubmitOptions<T, TResponse> = {
        optimistic,
        headers: options?.headers,
        onBefore: options?.onBefore,
        onSuccess: options?.onSuccess,
        onCancel: options?.onCancel,
        onFinish: options?.onFinish,
      }

      return (form as any)[method](url, httpOptions).catch((error: unknown) => {
        if (!(error instanceof HttpCancelledError)) {
          options?.onError?.(error)
        }

        throw error
      })
    }
  }

  const value = computed(() => toRaw(form.data()))

  return {
    get value() {
      return value.value
    },
    get processing() {
      return form.processing
    },

    get: wrapMethod('get'),
    post: wrapMethod('post'),
    put: wrapMethod('put'),
    patch: wrapMethod('patch'),

    delete<TResponse = unknown>(
      url: string,
      data?: OptimisticData<T>,
      options?: UseOptimisticOptions<TResponse>,
    ): Promise<TResponse> {
      return wrapMethod('delete')<TResponse>(url, data, options)
    },

    cancel() {
      form.cancel()
    },

    reset() {
      Object.assign(form, cloneDeep(defaults))
    },
  }
}
