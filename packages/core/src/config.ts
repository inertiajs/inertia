import { get, has, set } from 'lodash-es'
import { InertiaAppConfig } from './types'

// Generate all possible nested paths
type ConfigKeys<T> = T extends Function
  ? never
  : string extends keyof T
    ? string
    :
        | Extract<keyof T, string>
        | {
            [Key in Extract<keyof T, string>]: T[Key] extends object ? `${Key}.${ConfigKeys<T[Key]> & string}` : never
          }[Extract<keyof T, string>]

// Extract the value type at a given path
type ConfigValue<T, K extends ConfigKeys<T>> = K extends `${infer P}.${infer Rest}`
  ? P extends keyof T
    ? Rest extends ConfigKeys<T[P]>
      ? ConfigValue<T[P], Rest>
      : never
    : never
  : K extends keyof T
    ? T[K]
    : never

// Helper type for setting multiple config values with an object
type ConfigSetObject<T> = {
  [K in ConfigKeys<T>]?: ConfigValue<T, K>
}

type FirstLevelOptional<T> = {
  [K in keyof T]?: T[K] extends object ? { [P in keyof T[K]]?: T[K][P] } : T[K]
}

export class Config<TConfig extends {} = {}> {
  protected config: FirstLevelOptional<TConfig> = {}
  protected defaults: TConfig

  public constructor(defaults: TConfig) {
    this.defaults = defaults
  }

  public extend<TExtension extends {}>(defaults?: TExtension): Config<TConfig & TExtension> {
    if (defaults) {
      this.defaults = { ...this.defaults, ...defaults } as TConfig & TExtension
    }

    return this as unknown as Config<TConfig & TExtension>
  }

  public replace(newConfig: FirstLevelOptional<TConfig>): void {
    this.config = newConfig
  }

  public get<K extends ConfigKeys<TConfig>>(key: K): ConfigValue<TConfig, K> {
    return (has(this.config, key) ? get(this.config, key) : get(this.defaults, key)) as ConfigValue<TConfig, K>
  }

  public set<K extends ConfigKeys<TConfig>>(
    keyOrValues: K | Partial<ConfigSetObject<TConfig>>,
    value?: ConfigValue<TConfig, K>,
  ): void {
    if (typeof keyOrValues === 'string') {
      set(this.config, keyOrValues, value)
    } else {
      Object.entries(keyOrValues).forEach(([key, val]) => {
        set(this.config, key, val)
      })
    }
  }
}

export const config = new Config<InertiaAppConfig>({
  form: {
    recentlySuccessfulDuration: 2_000,
    forceIndicesArrayFormatInFormData: true,
  },
  legacy: {
    useDataElementForInitialPage: false,
  },
  prefetch: {
    cacheFor: 30_000,
    hoverDelay: 75,
  },
})
