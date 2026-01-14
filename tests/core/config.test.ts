import test, { expect } from '@playwright/test'
import { Config } from '../../packages/core/src/config'

type TestConfig = {
  form: {
    recentlySuccessfulDuration: number
  }
  prefetch: {
    cacheFor: number
    cacheTags: string[]
  }
  nested: {
    deep: {
      value: string
    }
  }
  optional?: boolean
}

function createConfig(): Config<TestConfig> {
  return new Config<TestConfig>({
    form: {
      recentlySuccessfulDuration: 2_000,
    },
    prefetch: {
      cacheFor: 30_000,
      cacheTags: [],
    },
    nested: {
      deep: {
        value: 'default',
      },
    },
  })
}

test.describe('config.ts', () => {
  test.describe('Config class', () => {
    test('returns defaults and custom values, falling back as needed', () => {
      const config = createConfig()

      expect(config.get('form.recentlySuccessfulDuration')).toBe(2_000)
      expect(config.get('prefetch.cacheFor')).toBe(30_000)

      config.set('prefetch.cacheFor', 60_000)

      expect(config.get('prefetch.cacheFor')).toBe(60_000)
      expect(config.get('prefetch.cacheTags')).toEqual([])
      expect(config.get('form.recentlySuccessfulDuration')).toBe(2_000)
    })

    test('sets values using dot notation and preserves siblings', () => {
      const config = createConfig()

      config.set('form.recentlySuccessfulDuration', 3_000)
      expect(config.get('form.recentlySuccessfulDuration')).toBe(3_000)

      config.set('prefetch.cacheFor', 60_000)
      expect(config.get('prefetch.cacheFor')).toBe(60_000)
      expect(config.get('prefetch.cacheTags')).toEqual([])
    })

    test('sets multiple values using object notation', () => {
      const config = createConfig()

      config.set({
        'form.recentlySuccessfulDuration': 3_000,
        'prefetch.cacheFor': 60_000,
      })

      expect(config.get('form.recentlySuccessfulDuration')).toBe(3_000)
      expect(config.get('prefetch.cacheFor')).toBe(60_000)
      expect(config.get('prefetch.cacheTags')).toEqual([])
    })

    test('replaces the entire config', () => {
      const config = createConfig()

      config.set({
        'form.recentlySuccessfulDuration': 3_000,
        'prefetch.cacheFor': 60_000,
      })

      config.replace({
        prefetch: {
          cacheFor: 120_000,
          cacheTags: ['tag1', 'tag2'],
        },
      })

      expect(config.get('form.recentlySuccessfulDuration')).toBe(2_000)
      expect(config.get('prefetch.cacheFor')).toBe(120_000)
      expect(config.get('prefetch.cacheTags')).toEqual(['tag1', 'tag2'])
    })

    test('extends type and defaults without overriding user config', () => {
      type BaseConfig = {
        base: { value: number }
      }

      type ExtendedConfig = {
        extended: { value: string }
      }

      const config = new Config<BaseConfig>({
        base: { value: 1 },
      })

      config.set('base.value', 5)
      expect(config.get('base.value')).toBe(5)

      const extended = config.extend<ExtendedConfig>({
        extended: { value: 'test' },
      })

      expect(extended.get('base.value')).toBe(5)
      expect(extended.get('extended.value')).toBe('test')
    })

    test('returns undefined for invalid keys', () => {
      const config = createConfig()

      // @ts-expect-error - Testing invalid key
      expect(config.get('nonexistent')).toBeUndefined()
      // @ts-expect-error - Testing invalid nested key
      expect(config.get('form.nonexistent')).toBeUndefined()
    })

    test('returns undefined for optional keys not set', () => {
      const config = createConfig()

      expect(config.get('optional')).toBeUndefined()
    })
  })
})
