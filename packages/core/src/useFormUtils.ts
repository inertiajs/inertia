import {
  FormDataType,
  Method,
  UrlMethodPair,
  UseFormArguments,
  UseFormSubmitArguments,
  UseFormSubmitOptions,
} from './types'
import { isUrlMethodPair } from './url'

/**
 * Helpers for parsing useForm() arguments and submission parameters.
 */
export class UseFormUtils {
  /**
   * Converts Wayfinder arguments into a callback function.
   *
   * Accepts either a Wayfinder object or separate method/url arguments,
   * and returns a function that evaluates them at submission time.
   */
  public static normalizeWayfinderArgsToCallback(
    ...args: [UrlMethodPair | (() => UrlMethodPair)] | [Method | (() => Method), string | (() => string)]
  ): () => UrlMethodPair {
    return () => {
      // Separate method and url - reconstruct wayfinder object
      if (args.length === 2) {
        return {
          method: typeof args[0] === 'function' ? args[0]() : args[0],
          url: typeof args[1] === 'function' ? args[1]() : args[1],
        }
      }

      // Wayfinder object - return as-is or call function
      return typeof args[0] === 'function' ? args[0]() : args[0]
    }
  }

  /**
   * Parses all useForm() arguments into { rememberKey, data, precognitionEndpoint }.
   *
   * useForm(data)
   * useForm(rememberKey, data)
   * useForm(method, url, data)
   * useForm(urlMethodPair, data)
   *
   */
  public static parseUseFormArguments<TForm extends FormDataType<TForm>>(
    ...args: UseFormArguments<TForm>
  ): {
    rememberKey: string | null
    data: TForm | (() => TForm)
    precognitionEndpoint: (() => UrlMethodPair) | null
  } {
    // Basic form: useForm(data)
    if (args.length === 1) {
      return {
        rememberKey: null,
        data: args[0],
        precognitionEndpoint: null,
      }
    }

    if (args.length === 2) {
      if (typeof args[0] === 'string') {
        // Rememberable form: useForm(rememberKey, data)
        return {
          rememberKey: args[0],
          data: args[1],
          precognitionEndpoint: null,
        }
      }

      // Form with Precognition + Wayfinder: useForm(wayfinder, data)
      return {
        rememberKey: null,
        data: args[1],
        precognitionEndpoint: this.normalizeWayfinderArgsToCallback(args[0]),
      }
    }

    // Form with Precognition: useForm(method, url, data)
    return {
      rememberKey: null,
      data: args[2],
      precognitionEndpoint: this.normalizeWayfinderArgsToCallback(args[0], args[1]),
    }
  }

  /**
   * Parses all submission arguments into { method, url, options }.
   * It uses the Precognition endpoint if no explicit method/url are provided.
   *
   * form.submit(method, url)
   * form.submit(method, url, options)
   * form.submit(urlMethodPair)
   * form.submit(urlMethodPair, options)
   * form.submit()
   * form.submit(options)
   */
  public static parseSubmitArguments(
    args: UseFormSubmitArguments,
    precognitionEndpoint: (() => UrlMethodPair) | null,
  ): { method: Method; url: string; options: UseFormSubmitOptions } {
    // Explicit method and url provided
    if (args.length === 3 || (args.length === 2 && typeof args[0] === 'string')) {
      return { method: args[0], url: args[1], options: args[2] ?? {} }
    }

    // Wayfinder object provided
    if (isUrlMethodPair(args[0])) {
      return { ...args[0], options: (args[1] as UseFormSubmitOptions) ?? {} }
    }

    // Use Precognition endpoint with optional options
    return { ...precognitionEndpoint!(), options: (args[0] as UseFormSubmitOptions) ?? {} }
  }
}
