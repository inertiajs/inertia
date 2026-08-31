import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { config } from '../src/config'
import { dirtyFormGuard } from '../src/dirtyFormGuard'

describe('dirtyFormGuard', () => {
  const unregisters: VoidFunction[] = []

  beforeEach(() => {
    config.replace({})

    vi.stubGlobal('confirm', vi.fn(() => true))
    vi.stubGlobal('window', {
      confirm: vi.fn(() => true),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })
    vi.stubGlobal('document', {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })
  })

  afterEach(() => {
    unregisters.splice(0).forEach((unregister) => unregister())
    vi.unstubAllGlobals()
  })

  const register = (...args: Parameters<typeof dirtyFormGuard.register>) => {
    const unregister = dirtyFormGuard.register(...args)
    unregisters.push(unregister)

    return unregister
  }

  it('returns true from confirmNavigation when no forms are registered', () => {
    expect(dirtyFormGuard.confirmNavigation()).toBe(true)
    expect(window.confirm).not.toHaveBeenCalled()
  })

  it('returns true from confirmNavigation when registered forms are clean', () => {
    register({
      isDirty: () => false,
      isSubmitting: () => false,
    })

    expect(dirtyFormGuard.confirmNavigation()).toBe(true)
    expect(window.confirm).not.toHaveBeenCalled()
  })

  it('prompts when a registered form is dirty', () => {
    register({
      isDirty: () => true,
      isSubmitting: () => false,
      message: 'Custom unsaved changes message',
    })

    expect(dirtyFormGuard.confirmNavigation()).toBe(true)
    expect(window.confirm).toHaveBeenCalledWith('Custom unsaved changes message')
  })

  it('returns false when the user dismisses the confirmation dialog', () => {
    vi.mocked(window.confirm).mockReturnValue(false)

    register({
      isDirty: () => true,
      isSubmitting: () => false,
    })

    expect(dirtyFormGuard.confirmNavigation()).toBe(false)
  })

  it('does not prompt when a dirty form is submitting', () => {
    register({
      isDirty: () => true,
      isSubmitting: () => true,
    })

    expect(dirtyFormGuard.hasDirtyForms()).toBe(false)
    expect(dirtyFormGuard.confirmNavigation()).toBe(true)
    expect(window.confirm).not.toHaveBeenCalled()
  })

  it('uses the configured default message when no custom message is provided', () => {
    config.set('form.unsavedChangesMessage', 'Default unsaved message')

    register({
      isDirty: () => true,
      isSubmitting: () => false,
    })

    dirtyFormGuard.confirmNavigation()

    expect(window.confirm).toHaveBeenCalledWith('Default unsaved message')
  })
})
