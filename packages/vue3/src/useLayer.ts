import { createLayerApi, type LayerApi } from '@inertiajs/core'
import { hasInjectionContext, inject, type InjectionKey } from 'vue'

export const layerIdKey: InjectionKey<string> = Symbol('inertiaLayerId')

export const useLayerId = (): string | undefined => (hasInjectionContext() ? inject(layerIdKey, undefined) : undefined)

export default function useLayer(): LayerApi {
  return createLayerApi(useLayerId())
}
