import { describe, expect, it } from 'vitest'
import { UseFormUtils } from '../src/useFormUtils'

describe('UseFormUtils.parseUseFormArguments', () => {
  it('reads a remember key', () => {
    expect(UseFormUtils.parseUseFormArguments('login', { email: '' })).toMatchObject({
      rememberKey: 'login',
      data: { email: '' },
      precognitionEndpoint: null,
    })
  })

  it.each([null, undefined])('treats a %s remember key as a form that is not remembered', (rememberKey) => {
    expect(UseFormUtils.parseUseFormArguments(rememberKey, { email: '' })).toMatchObject({
      rememberKey: null,
      data: { email: '' },
      precognitionEndpoint: null,
    })
  })
})
