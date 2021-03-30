export type Errors = Record<string, Record<string, string>|Array<string>|string>

export type FormDataConvertible = Date|File|Blob|boolean|string|number|null|undefined

export enum Method {
  GET = 'get',
  POST = 'post',
  PUT = 'put',
  PATCH = 'patch',
  DELETE = 'delete'
}

export type RequestPayload = Record<string, FormDataConvertible>|FormData;

