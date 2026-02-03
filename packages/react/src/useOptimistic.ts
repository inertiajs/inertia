import { FormDataType, HttpCancelledError, UseHttpSubmitOptions } from '@inertiajs/core'
import { cloneDeep } from 'lodash-es'
import { useCallback, useMemo, useRef } from 'react'
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
  const defaultsRef = useRef(cloneDeep(initialValue))
  const form = useHttp<T, unknown>(cloneDeep(initialValue))

  const submit = useCallback(
    <TResponse = unknown>(
      method: 'get' | 'post' | 'put' | 'patch' | 'delete',
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
    },
    [form],
  )

  const get = useCallback(
    <TResponse = unknown>(
      url: string,
      data: OptimisticData<T>,
      options?: UseOptimisticOptions<TResponse>,
    ): Promise<TResponse> => {
      return submit('get', url, data, options)
    },
    [submit],
  )

  const post = useCallback(
    <TResponse = unknown>(
      url: string,
      data: OptimisticData<T>,
      options?: UseOptimisticOptions<TResponse>,
    ): Promise<TResponse> => {
      return submit('post', url, data, options)
    },
    [submit],
  )

  const put = useCallback(
    <TResponse = unknown>(
      url: string,
      data: OptimisticData<T>,
      options?: UseOptimisticOptions<TResponse>,
    ): Promise<TResponse> => {
      return submit('put', url, data, options)
    },
    [submit],
  )

  const patch = useCallback(
    <TResponse = unknown>(
      url: string,
      data: OptimisticData<T>,
      options?: UseOptimisticOptions<TResponse>,
    ): Promise<TResponse> => {
      return submit('patch', url, data, options)
    },
    [submit],
  )

  const deleteMethod = useCallback(
    <TResponse = unknown>(
      url: string,
      data?: OptimisticData<T>,
      options?: UseOptimisticOptions<TResponse>,
    ): Promise<TResponse> => {
      return submit('delete', url, data, options)
    },
    [submit],
  )

  const cancel = useCallback(() => {
    form.cancel()
  }, [form])

  const reset = useCallback(() => {
    form.setData(cloneDeep(defaultsRef.current))
  }, [form])

  return useMemo(
    () => ({
      get value() {
        return form.data
      },
      get processing() {
        return form.processing
      },
      get,
      post,
      put,
      patch,
      delete: deleteMethod,
      cancel,
      reset,
    }),
    [form.data, form.processing, get, post, put, patch, deleteMethod, cancel, reset],
  )
}
