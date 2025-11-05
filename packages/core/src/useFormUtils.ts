import { FormDataType, Method, UrlMethodPair, UseFormArguments, UseFormSubmitOptions, UseFormSubmitArguments } from './types'
import { isUrlMethodPair } from './url'

export class UseFormUtils {
  public static normalizeWayfinderArgsToCallback(
    ...args: [UrlMethodPair | (() => UrlMethodPair)] | [Method | (() => Method), string | (() => string)]
  ): () => UrlMethodPair {
    return () => {
      if (args.length === 2) {
        return {
          method: typeof args[0] === 'function' ? args[0]() : args[0],
          url: typeof args[1] === 'function' ? args[1]() : args[1],
        }
      }

      return typeof args[0] === 'function' ? args[0]() : args[0]
    }
  }

  public static parseUseFormArgs<TForm extends FormDataType<TForm>>(
    ...args: UseFormArguments<TForm>
  ): {
    rememberKey: string | null
    data: TForm | (() => TForm)
    precognitionEndpoint: (() => UrlMethodPair) | null
  } {
    // Pattern 1: [data: TForm | (() => TForm)]
    if (args.length === 1) {
      return {
        rememberKey: null,
        data: args[0] as TForm | (() => TForm),
        precognitionEndpoint: null,
      }
    }

    // Pattern 2 & 3: Two arguments - need to distinguish by first arg type
    if (args.length === 2) {
      if (typeof args[0] === 'string') {
        // Pattern 2: [rememberKey: string, data: TForm | (() => TForm)]
        return {
          rememberKey: args[0],
          data: args[1] as TForm | (() => TForm),
          precognitionEndpoint: null,
        }
      } else {
        // Pattern 3: [urlMethodPair: UrlMethodPair | (() => UrlMethodPair), data: TForm | (() => TForm)]
        return {
          rememberKey: null,
          data: args[1] as TForm | (() => TForm),
          precognitionEndpoint: this.normalizeWayfinderArgsToCallback(args[0]),
        }
      }
    }

    // Pattern 4: [method: Method | (() => Method), url: string | (() => string), data: TForm | (() => TForm)]
    return {
      rememberKey: null,
      data: args[2] as TForm | (() => TForm),
      precognitionEndpoint: this.normalizeWayfinderArgsToCallback(args[0], args[1]),
    }
  }

  public static parseSubmitArgs(
    args: UseFormSubmitArguments,
    precognitionEndpoint: (() => UrlMethodPair) | null,
  ): { method: Method; url: string; options: UseFormSubmitOptions } {
    if (args.length === 3 || (args.length === 2 && typeof args[0] === 'string')) {
      // All arguments passed, or method + url
      return { method: args[0], url: args[1], options: args[2] ?? {} }
    }

    if (isUrlMethodPair(args[0])) {
      // Wayfinder + optional options
      return { ...args[0], options: (args[1] ?? {}) as UseFormSubmitOptions }
    }

    // No arguments, or only options passed, use precognition endpoint...
    return { ...precognitionEndpoint!(), options: (args[0] ?? {}) as UseFormSubmitOptions }
  }
}
