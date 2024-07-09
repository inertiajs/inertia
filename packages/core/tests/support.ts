import { AxiosHeaders, AxiosResponse } from 'axios'
import { ActiveVisit, Page } from '../src'

export const getRequestParams = (overrides: Partial<ActiveVisit> = {}): ActiveVisit => ({
  url: new URL('/', 'http://localhost:3000'),
  method: 'get',
  data: {},
  headers: {},
  onCancelToken: () => {},
  onBefore: () => {},
  onStart: () => {},
  onProgress: () => {},
  onFinish: () => {},
  onCancel: () => {},
  onSuccess: () => {},
  onError: () => {},
  completed: false,
  cancelled: false,
  interrupted: false,
  forceFormData: false,
  queryStringArrayFormat: 'brackets',
  replace: false,
  only: [],
  except: [],
  preserveScroll: false,
  preserveState: false,
  errorBag: '',
  async: false,
  ...overrides,
})

export const axiosResponse = (overrides: Partial<AxiosResponse> = {}): AxiosResponse => ({
  data: {},
  status: 200,
  statusText: 'OK',
  headers: {},
  config: {
    headers: new AxiosHeaders(),
  },
  request: {},
  ...overrides,
})

export const pageComponent = (overrides: Partial<Page> = {}): Page => ({
  component: 'Home',
  props: {
    errors: {},
  },
  url: '/',
  version: '1',
  scrollRegions: [],
  rememberedState: {},
  ...overrides,
})

export const homePage = pageComponent()
