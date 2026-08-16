import { Component, provideZonelessChangeDetection } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { http } from '@inertiajs/core'
import { useHttp } from './use-http'

@Component({ template: '' })
class UseHttpHost {
  readonly form = useHttp({ name: 'Ada' })
}

describe('useHttp', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [UseHttpHost],
      providers: [provideZonelessChangeDetection()],
    })
  })

  it('includes the request URL in response errors', async () => {
    const getClient = vi.spyOn(http, 'getClient').mockReturnValue({
      request: vi.fn().mockResolvedValue({ status: 500, data: '{}', headers: {} }),
    })
    const fixture = TestBed.createComponent(UseHttpHost)

    await expect(fixture.componentInstance.form.post('/users')).rejects.toMatchObject({
      name: 'HttpResponseError',
      message: 'Request failed with status 500 (/users)',
      url: '/users',
    })

    getClient.mockRestore()
  })
})
