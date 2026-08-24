import { createLayerApi, LayerApi } from '@inertiajs/core'
import { createContext, use, useMemo } from 'react'

export const layerContext = createContext<string | null>(null)
layerContext.displayName = 'InertiaLayerContext'

export const useLayerId = (): string | undefined => use(layerContext) ?? undefined

export default function useLayer(): LayerApi {
  const layerId = useLayerId()

  return useMemo(() => createLayerApi(layerId), [layerId])
}
