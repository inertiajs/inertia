import { get, set } from 'lodash-es'
import { CacheForOption, VisitOptions } from './types'

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

export class Config<TConfig extends {} = {}> {
  protected config: TConfig

  public constructor(initialConfig: TConfig) {
    this.config = initialConfig
  }

  public extend<TExtension extends {}>(defaults?: Partial<TExtension>): Config<TConfig & TExtension> {
    if (defaults) {
      this.mergeConfig(defaults as Partial<TConfig & TExtension>)
    }

    return this as unknown as Config<TConfig & TExtension>
  }

  public mergeConfig(newConfig: Partial<TConfig>): void {
    this.config = { ...this.config, ...newConfig }
  }

  public get<K extends ConfigKeys<TConfig>>(key: K): ConfigValue<TConfig, K> {
    return get(this.config, key) as ConfigValue<TConfig, K>
  }

  public set<K extends ConfigKeys<TConfig>>(key: K, value: ConfigValue<TConfig, K>): void {
    set(this.config, key, value)
  }
}

export const config = new Config<{
  form: {
    recentlySuccessfulDuration: number
  }
  prefetch: {
    cacheFor: CacheForOption | CacheForOption[]
  }
  visitOptions?: (href: string, options: VisitOptions) => VisitOptions
}>({
  form: {
    recentlySuccessfulDuration: 2_000,
  },
  prefetch: {
    cacheFor: 30_000,
  },
})
