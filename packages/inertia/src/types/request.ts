export type Errors = Record<string, string>
export type ErrorBag = Record<string, Errors>

export type FormDataConvertible = Date|File|Blob|boolean|string|number|null|undefined

export enum Method {
  GET = 'get',
  POST = 'post',
  PUT = 'put',
  PATCH = 'patch',
  DELETE = 'delete'
}

export type RequestPayload = Record<string, FormDataConvertible>|FormData;

