import { isEqual } from 'es-toolkit'
import { get, set } from 'es-toolkit/compat'
import { partialReloadRequestsProp } from '../partialReload'
import type { RequestParams } from '../requestParams'
import { ErrorBag, Errors, Page, PageProps, Tier } from '../types'

// Merges a partial response into the tier it refreshes, so the props the request did not ask for survive.

function isObject(item: any): boolean {
  return item && typeof item === 'object' && !Array.isArray(item)
}

function hasUniqueProperty(item: any, property: string): boolean {
  return item && typeof item === 'object' && property in item
}

function appendWithMatching(
  existingItems: any[],
  newItems: any[],
  newItemsMap: Map<any, any>,
  uniqueProperty: string,
): any[] {
  // Update existing items with new values, keep non-matching items
  const updatedExisting = existingItems.map((item) => {
    if (hasUniqueProperty(item, uniqueProperty) && newItemsMap.has(item[uniqueProperty])) {
      return newItemsMap.get(item[uniqueProperty])
    }

    return item
  })

  // Filter new items to only include those not already in existing items
  const newItemsToAdd = newItems.filter((item) => {
    if (!hasUniqueProperty(item, uniqueProperty)) {
      return true // Always add items without unique property
    }

    return !existingItems.some(
      (existing) => hasUniqueProperty(existing, uniqueProperty) && existing[uniqueProperty] === item[uniqueProperty],
    )
  })

  return [...updatedExisting, ...newItemsToAdd]
}

function prependWithMatching(
  existingItems: any[],
  newItems: any[],
  newItemsMap: Map<any, any>,
  uniqueProperty: string,
): any[] {
  // Filter existing items, keeping only those not being updated
  const untouchedExisting = existingItems.filter((item) => {
    if (hasUniqueProperty(item, uniqueProperty)) {
      return !newItemsMap.has(item[uniqueProperty])
    }

    return true
  })

  return [...newItems, ...untouchedExisting]
}

function mergeOrMatchItems(
  existingItems: any[],
  newItems: any[],
  matchProp: string,
  matchPropsOn: string[],
  shouldAppend = true,
) {
  const items = Array.isArray(existingItems) ? existingItems : []

  // Find the matching key for this specific property path
  const matchingKey = matchPropsOn.find((key) => {
    const keyPath = key.split('.').slice(0, -1).join('.')

    return keyPath === matchProp
  })

  // If no matching key is configured, simply concatenate the arrays
  if (!matchingKey) {
    return shouldAppend ? [...items, ...newItems] : [...newItems, ...items]
  }

  // Extract the property name we'll use to match items (e.g., 'id' from 'users.data.id')
  const uniqueProperty = matchingKey.split('.').pop() || ''

  // Create a map of new items by their unique property lookups
  const newItemsMap = new Map()

  newItems.forEach((item) => {
    if (hasUniqueProperty(item, uniqueProperty)) {
      newItemsMap.set(item[uniqueProperty], item)
    }
  })

  return shouldAppend
    ? appendWithMatching(items, newItems, newItemsMap, uniqueProperty)
    : prependWithMatching(items, newItems, newItemsMap, uniqueProperty)
}

function mergeProp(
  pageResponse: Page,
  currentProps: PageProps,
  prop: string,
  shouldAppend: boolean,
  matchPropsOn: string[],
): void {
  const currentProp = get(currentProps, prop)
  const incomingProp = get(pageResponse.props, prop)

  if (Array.isArray(incomingProp)) {
    const newArray = mergeOrMatchItems((currentProp || []) as any[], incomingProp, prop, matchPropsOn, shouldAppend)

    set(pageResponse.props, prop, newArray)
  } else if (typeof incomingProp === 'object' && incomingProp !== null) {
    const newObject = {
      ...(currentProp || {}),
      ...incomingProp,
    }

    set(pageResponse.props, prop, newObject)
  }
}

function deepMergeProp(target: any, source: any, matchProp: string, matchPropsOn: string[]): any {
  if (Array.isArray(source)) {
    return mergeOrMatchItems(target, source, matchProp, matchPropsOn)
  }

  if (typeof source === 'object' && source !== null) {
    // Merge objects by iterating over keys
    return Object.keys(source).reduce(
      (acc, key) => {
        acc[key] = deepMergeProp(target ? target[key] : undefined, source[key], `${matchProp}.${key}`, matchPropsOn)
        return acc
      },
      { ...target },
    )
  }

  // If the source is neither an array nor an object, simply return it
  return source
}

function deepMergeObjects(target: PageProps, source: PageProps): PageProps {
  const result = { ...target }

  for (const key of Object.keys(source)) {
    const targetValue = target[key]
    const sourceValue = source[key]

    if (isObject(targetValue) && isObject(sourceValue)) {
      result[key] = deepMergeObjects(targetValue as PageProps, sourceValue as PageProps)
    } else {
      result[key] = sourceValue
    }
  }

  return result
}

function mergePropsInto(pageResponse: Page, currentProps: PageProps, nestedProps: string[]): void {
  const matchPropsOn = pageResponse.matchPropsOn || []

  ;(pageResponse.mergeProps || []).forEach((prop) => mergeProp(pageResponse, currentProps, prop, true, matchPropsOn))
  ;(pageResponse.prependProps || []).forEach((prop) => mergeProp(pageResponse, currentProps, prop, false, matchPropsOn))
  ;(pageResponse.deepMergeProps || []).forEach((prop) => {
    const currentProp = get(currentProps, prop)
    const incomingProp = get(pageResponse.props, prop)

    set(pageResponse.props, prop, deepMergeProp(currentProp, incomingProp, prop, matchPropsOn))
  })

  const nestedTopKeys = new Set(nestedProps.filter((prop) => prop.includes('.')).map((prop) => prop.split('.')[0]))

  for (const key of nestedTopKeys) {
    const currentValue = currentProps[key]

    if (isObject(currentValue) && isObject(pageResponse.props[key])) {
      pageResponse.props[key] = deepMergeObjects(currentValue as PageProps, pageResponse.props[key] as PageProps)
    }
  }

  pageResponse.props = { ...currentProps, ...pageResponse.props }
}

export const mergeOncePropsInto = (response: Page, tier: Tier | undefined, force = false): void => {
  if (!tier) {
    return
  }

  Object.entries(response.onceProps ?? {}).forEach(([key, onceProp]) => {
    const existingOnceProp = tier.onceProps?.[key]

    if (existingOnceProp === undefined) {
      return
    }

    if (force || get(response.props, onceProp.prop) === undefined) {
      set(response.props, onceProp.prop, get(tier.props, existingOnceProp.prop))
      response.onceProps![key].expiresAt = existingOnceProp.expiresAt
    }
  })
}

const shouldPreserveErrors = (response: Page, tier: Tier, params: RequestParams): boolean => {
  if (!params.all().preserveErrors) {
    return false
  }

  const currentErrors = tier.props.errors as Errors | undefined

  if (!currentErrors || Object.keys(currentErrors).length === 0) {
    return false
  }

  const responseErrors = response.props.errors

  return !responseErrors || Object.keys(responseErrors).length === 0
}

const mergedRescued = (response: Page, current: string[] = [], params: RequestParams): string[] => {
  const rescued = new Set(current.filter((prop) => !partialReloadRequestsProp(params.all(), prop)))

  ;(response.rescuedProps ?? []).forEach((prop) => rescued.add(prop))

  return Array.from(rescued)
}

export const mergeProps = (response: Page, tier: Tier, params: RequestParams): void => {
  if (!params.isPartial() || tier.component !== response.component) {
    return
  }

  mergePropsInto(response, tier.props, [...params.all().only, ...params.all().except])

  if (shouldPreserveErrors(response, tier, params)) {
    response.props.errors = tier.props.errors as Errors & ErrorBag
  }

  if (tier.scrollProps) {
    response.scrollProps = { ...tier.scrollProps, ...response.scrollProps }
  }

  if (Object.keys(tier.onceProps ?? {}).length > 0) {
    response.onceProps = { ...tier.onceProps, ...response.onceProps }
  }

  if (Object.keys(tier.initialDeferredProps ?? {}).length > 0) {
    response.initialDeferredProps = tier.initialDeferredProps
  }

  if (params.isDeferredPropsRequest()) {
    response.flash = { ...tier.flash }
  }

  response.rescuedProps = mergedRescued(response, tier.rescuedProps, params)
}

// Keeps the identity of props the response did not change, so components holding them do not re-render.
export const preserveEqualProps = (response: Page, tier: Tier | undefined): void => {
  if (!tier || tier.component !== response.component) {
    return
  }

  Object.entries(response.props).forEach(([key, value]) => {
    if (isEqual(value, tier.props[key])) {
      response.props[key] = tier.props[key]
    }
  })
}
