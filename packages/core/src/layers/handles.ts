import { interceptors } from '../interceptors'
import { LayerHandle } from '../types'

// What the registry needs of a handle beyond what the app is given.
export interface RegistryHandle extends LayerHandle {
  deliver(childId: string, name: string, payload?: unknown): void
  fireOnClose(): void
}

const layerRegistry = new Map<string, RegistryHandle[]>()

export const registryWrite = (id: string, entry: RegistryHandle): void => {
  layerRegistry.set(id, [...(layerRegistry.get(id) ?? []), entry])
}

export const registryRead = (id: string): RegistryHandle | undefined => layerRegistry.get(id)?.at(-1)

export const registryHas = (id: string): boolean => layerRegistry.has(id)

export const registryClose = (id: string): void => {
  layerRegistry.get(id)?.forEach((handle) => handle.fireOnClose())
  layerRegistry.delete(id)
}

export const registryRekey = (from: string, to: string): void => {
  const moving = layerRegistry.get(from)

  if (moving === undefined) {
    return
  }

  moving.forEach((handle) => (handle.id = to))
  layerRegistry.set(to, [...(layerRegistry.get(to) ?? []), ...moving])
  layerRegistry.delete(from)
}

export const layerHandleFor = (id: string, create: (id: string) => RegistryHandle): LayerHandle => {
  if (typeof window === 'undefined') {
    return create(id)
  }

  const existing = registryRead(id)

  if (existing) {
    return existing
  }

  const handle = create(id)

  registryWrite(id, handle)

  return handle
}

export const createLayerHandle = (
  id: string,
  close: (id: string) => Promise<void>,
  ownerOf: (id: string) => string | null | undefined,
): RegistryHandle => {
  const subscriptions = new Map<string, ((payload?: unknown, childId?: string) => void)[]>()
  const onCloseCallbacks: (() => void)[] = []

  const deliver = (childId: string, name: string, payload?: unknown): void => {
    for (const callback of subscriptions.get(name) ?? []) {
      callback(payload, childId)
    }
  }

  const handle: RegistryHandle = {
    id,
    on: (name, callback) => {
      subscriptions.set(name, [...(subscriptions.get(name) ?? []), callback])

      return () =>
        subscriptions.set(
          name,
          (subscriptions.get(name) ?? []).filter((subscribed) => subscribed !== callback),
        )
    },
    once: (name, callback) => {
      const stop = handle.on(name, (payload, childId) => {
        stop()
        callback(payload, childId)
      })

      return stop
    },
    onClose: (callback) => {
      onCloseCallbacks.push(callback)

      return () => {
        const at = onCloseCallbacks.indexOf(callback)

        if (at > -1) {
          onCloseCallbacks.splice(at, 1)
        }
      }
    },
    close: () => close(handle.id),
    emit: (name, payload) => {
      const owner = ownerOf(handle.id)

      interceptors.fireLayerEvent({ type: 'event', from: handle.id, to: owner ?? null, name, payload })

      if (owner === null || owner === undefined) {
        return
      }

      layerRegistry.get(owner)?.forEach((ownerHandle) => ownerHandle.deliver(handle.id, name, payload))
    },
    deliver,
    fireOnClose: () => {
      for (const callback of onCloseCallbacks) {
        callback()
      }
    },
  }

  return handle
}
