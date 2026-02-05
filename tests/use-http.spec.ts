import { expect, test } from '@playwright/test'
import { requests } from './support'

test.describe('useHttp', () => {
  test('it makes GET requests and returns JSON response', async ({ page }) => {
    await page.goto('/use-http')

    await page.fill('#search-query', 'test query')
    await page.click('#search-button')

    await expect(page.locator('#search-result')).toBeVisible()
    await expect(page.locator('#search-result')).toContainText('Items: apple, banana, cherry')
    await expect(page.locator('#search-result')).toContainText('Total: 3')
    await expect(page.locator('#search-result')).toContainText('Query: test query')
    await expect(page.locator('#search-response')).toContainText('Response stored: 3 items')
  })

  test('it makes POST requests and tracks success state', async ({ page }) => {
    await page.goto('/use-http')

    await page.fill('#create-name', 'John Doe')
    await page.fill('#create-email', 'john@example.com')
    await page.click('#create-button')

    await expect(page.locator('#create-result')).toBeVisible()
    await expect(page.locator('#create-result')).toContainText('Created user ID: 123')
    await expect(page.locator('#create-result')).toContainText('Name: John Doe')
    await expect(page.locator('#create-result')).toContainText('Email: john@example.com')
    await expect(page.locator('#create-success')).toBeVisible()
    await expect(page.locator('#create-recently-successful')).toBeVisible()
  })

  test('it tracks isDirty state', async ({ page }) => {
    await page.goto('/use-http')

    await expect(page.locator('#create-dirty')).not.toBeVisible()

    await page.fill('#create-name', 'Changed name')

    await expect(page.locator('#create-dirty')).toBeVisible()
  })

  test('it handles 422 validation errors', async ({ page }) => {
    await page.goto('/use-http')

    await page.click('#validate-button')

    await expect(page.locator('#validate-name-error')).toBeVisible()
    await expect(page.locator('#validate-name-error')).toContainText('The name field is required.')
    await expect(page.locator('#validate-email-error')).toBeVisible()
    await expect(page.locator('#validate-email-error')).toContainText('The email field must be a valid email address.')
    await expect(page.locator('#validate-has-errors')).toBeVisible()
  })

  test('it clears validation errors', async ({ page }) => {
    await page.goto('/use-http')

    await page.click('#validate-button')
    await expect(page.locator('#validate-has-errors')).toBeVisible()

    await page.click('#clear-errors-button')
    await expect(page.locator('#validate-has-errors')).not.toBeVisible()
    await expect(page.locator('#validate-name-error')).not.toBeVisible()
    await expect(page.locator('#validate-email-error')).not.toBeVisible()
  })

  test('it clears a subset of validation errors', async ({ page }) => {
    await page.goto('/use-http')

    await page.click('#validate-button')
    await expect(page.locator('#validate-has-errors')).toBeVisible()
    await expect(page.locator('#validate-name-error')).toBeVisible()
    await expect(page.locator('#validate-email-error')).toBeVisible()

    await page.click('#clear-name-error-button')
    await expect(page.locator('#validate-has-errors')).toBeVisible()
    await expect(page.locator('#validate-name-error')).not.toBeVisible()
    await expect(page.locator('#validate-email-error')).toBeVisible()
  })

  test('it sets a single error', async ({ page }) => {
    await page.goto('/use-http')

    await expect(page.locator('#validate-has-errors')).not.toBeVisible()

    await page.click('#set-name-error-button')
    await expect(page.locator('#validate-has-errors')).toBeVisible()
    await expect(page.locator('#validate-name-error')).toContainText('Manual name error')
    await expect(page.locator('#validate-email-error')).not.toBeVisible()
  })

  test('it sets multiple errors', async ({ page }) => {
    await page.goto('/use-http')

    await expect(page.locator('#validate-has-errors')).not.toBeVisible()

    await page.click('#set-multiple-errors-button')
    await expect(page.locator('#validate-has-errors')).toBeVisible()
    await expect(page.locator('#validate-name-error')).toContainText('Multi name error')
    await expect(page.locator('#validate-email-error')).toContainText('Multi email error')
  })

  test('it makes DELETE requests', async ({ page }) => {
    await page.goto('/use-http')

    await page.fill('#delete-user-id', '42')
    await page.click('#delete-button')

    await expect(page.locator('#delete-result')).toBeVisible()
    await expect(page.locator('#delete-result')).toContainText('Deleted user ID: 42')
  })

  test('it cancels in-flight requests', async ({ page }) => {
    await page.goto('/use-http')

    await page.click('#slow-request-button')
    await expect(page.locator('#slow-processing')).toBeVisible()

    await page.click('#cancel-button')
    await expect(page.locator('#cancelled-message')).toBeVisible()
    await expect(page.locator('#cancelled-message')).toContainText('Request was cancelled')
  })

  test('it handles server errors (500)', async ({ page }) => {
    await page.goto('/use-http')

    await page.click('#error-button')

    await expect(page.locator('#error-message')).toBeVisible()
    await expect(page.locator('#error-message')).toContainText('Server returned 500 error')
  })

  test('it resets form to defaults', async ({ page }) => {
    await page.goto('/use-http')

    await page.fill('#create-name', 'Test Name')
    await expect(page.locator('#reset-name-value')).toContainText('Current name: Test Name')

    await page.click('#reset-button')
    await expect(page.locator('#reset-name-value')).toContainText('Current name:')
    await expect(page.locator('#reset-name-value')).not.toContainText('Test Name')
  })

  test('it sets current values as new defaults', async ({ page }) => {
    await page.goto('/use-http')

    await page.fill('#create-name', 'New Default')
    await page.click('#defaults-button')

    await page.fill('#create-name', 'Changed Again')
    await page.click('#reset-button')

    await expect(page.locator('#reset-name-value')).toContainText('Current name: New Default')
  })

  test('it recentlySuccessful state resets after timeout', async ({ page }) => {
    await page.goto('/use-http')

    await page.fill('#create-name', 'John Doe')
    await page.fill('#create-email', 'john@example.com')
    await page.click('#create-button')

    await expect(page.locator('#create-recently-successful')).toBeVisible()

    await page.waitForTimeout(2500)

    await expect(page.locator('#create-recently-successful')).not.toBeVisible()
    await expect(page.locator('#create-success')).toBeVisible()
  })

  test.describe('HTTP Methods', () => {
    test('it makes PUT requests', async ({ page }) => {
      await page.goto('/use-http/methods')

      await page.fill('#put-name', 'Updated Name')
      await page.fill('#put-email', 'updated@example.com')
      await page.click('#put-button')

      await expect(page.locator('#put-result')).toBeVisible()
      await expect(page.locator('#put-result')).toContainText('PUT Success')
      await expect(page.locator('#put-result')).toContainText('Name: Updated Name')
      await expect(page.locator('#put-result')).toContainText('Email: updated@example.com')
    })

    test('it makes PATCH requests', async ({ page }) => {
      await page.goto('/use-http/methods')

      await page.fill('#put-name', 'Patched Name')
      await page.fill('#put-email', 'patched@example.com')
      await page.click('#patch-button')

      await expect(page.locator('#patch-result')).toBeVisible()
      await expect(page.locator('#patch-result')).toContainText('PATCH Success')
      await expect(page.locator('#patch-result')).toContainText('Name: Patched Name')
      await expect(page.locator('#patch-result')).toContainText('Email: patched@example.com')
    })
  })

  test.describe('Transform', () => {
    test('it transforms data before submission', async ({ page }) => {
      await page.goto('/use-http/transform')

      await page.fill('#transform-name', 'John Doe')
      await page.fill('#transform-email', 'JOHN@EXAMPLE.COM')
      await page.click('#transform-button')

      await expect(page.locator('#transform-result')).toBeVisible()
      await expect(page.locator('#transform-result')).toContainText('Transformed Name: JOHN DOE')
      await expect(page.locator('#transform-result')).toContainText('Transformed Email: john@example.com')
      await expect(page.locator('#transform-result')).toContainText('Original Name: John Doe')
    })
  })

  test.describe('File Uploads', () => {
    test('it uploads a single file', async ({ page }) => {
      await page.goto('/use-http/file-upload')

      await page.fill('#upload-description', 'Test upload')
      await page.setInputFiles('#upload-file', {
        name: 'test-file.txt',
        mimeType: 'text/plain',
        buffer: Buffer.from('Hello, World!'),
      })
      await page.click('#upload-button')

      await expect(page.locator('#upload-result')).toBeVisible()
      await expect(page.locator('#upload-result')).toContainText('Upload Success')
      await expect(page.locator('#upload-result')).toContainText('Files: 1')
      await expect(page.locator('#upload-result')).toContainText('test-file.txt')
    })

    test('it uploads multiple files', async ({ page }) => {
      await page.goto('/use-http/file-upload')

      await page.fill('#upload-description', 'Multiple files test')
      await page.setInputFiles('#upload-files', [
        {
          name: 'file1.txt',
          mimeType: 'text/plain',
          buffer: Buffer.from('File 1 content'),
        },
        {
          name: 'file2.txt',
          mimeType: 'text/plain',
          buffer: Buffer.from('File 2 content'),
        },
      ])
      await page.click('#upload-button')

      await expect(page.locator('#upload-result')).toBeVisible()
      await expect(page.locator('#upload-result')).toContainText('Upload Success')
      await expect(page.locator('#upload-result')).toContainText('Files: 2')
      await expect(page.locator('#upload-result')).toContainText('file1.txt')
      await expect(page.locator('#upload-result')).toContainText('file2.txt')
    })

    test('it uses multipart/form-data for file uploads', async ({ page }) => {
      await page.goto('/use-http/file-upload')

      requests.listenForFinished(page)

      await page.setInputFiles('#upload-file', {
        name: 'test-file.txt',
        mimeType: 'text/plain',
        buffer: Buffer.from('Hello, World!'),
      })
      await page.click('#upload-button')

      await expect(page.locator('#upload-result')).toBeVisible()

      const uploadRequest = requests.finished.find((r) => r.url().includes('/api/upload'))
      expect(uploadRequest).toBeDefined()
      expect(uploadRequest?.headers()['content-type']).toContain('multipart/form-data')
    })
  })

  test.describe('Headers', () => {
    test('it sends custom headers', async ({ page }) => {
      await page.goto('/use-http/headers')

      await page.click('#headers-button')

      await expect(page.locator('#headers-result')).toBeVisible()
      await expect(page.locator('#headers-result')).toContainText('Custom Header Received: custom-value')
      await expect(page.locator('#headers-result')).toContainText('Another Header: another-value')
    })

    test('it uses application/json for non-file data', async ({ page }) => {
      await page.goto('/use-http/headers')

      requests.listenForFinished(page)

      await page.click('#headers-button')

      await expect(page.locator('#headers-result')).toBeVisible()
      await expect(page.locator('#headers-result')).toContainText('Content-Type: application/json')
    })
  })

  test.describe('Lifecycle Callbacks', () => {
    test('it fires onBefore, onStart, onSuccess, and onFinish for successful requests', async ({ page }) => {
      await page.goto('/use-http/lifecycle')

      await page.fill('#lifecycle-value', 'test')
      await page.click('#lifecycle-button')

      await expect(page.locator('#lifecycle-events')).toContainText('onBefore')
      await expect(page.locator('#lifecycle-events')).toContainText('onStart')
      await expect(page.locator('#lifecycle-events')).toContainText('onSuccess')
      await expect(page.locator('#lifecycle-events')).toContainText('onFinish')
      await expect(page.locator('#lifecycle-events')).not.toContainText('onError')
    })

    test('it fires onBefore, onStart, onError, and onFinish for validation errors', async ({ page }) => {
      await page.goto('/use-http/lifecycle')

      await page.click('#lifecycle-error-button')

      await expect(page.locator('#lifecycle-error-events')).toContainText('onBefore')
      await expect(page.locator('#lifecycle-error-events')).toContainText('onStart')
      await expect(page.locator('#lifecycle-error-events')).toContainText('onError')
      await expect(page.locator('#lifecycle-error-events')).toContainText('onFinish')
      await expect(page.locator('#lifecycle-error-events')).not.toContainText('onSuccess')
    })

    test('it cancels the request when onBefore returns false', async ({ page }) => {
      await page.goto('/use-http/lifecycle')

      await page.click('#lifecycle-cancel-button')

      await expect(page.locator('#lifecycle-cancelled')).toBeVisible()
      await expect(page.locator('#lifecycle-cancelled')).toContainText('onBefore returned false')
      await expect(page.locator('#lifecycle-cancel-processing')).not.toBeVisible()
    })
  })

  test.describe('Nested Data', () => {
    test('it serializes nested objects', async ({ page }) => {
      await page.goto('/use-http/nested-data')

      await page.fill('#nested-user-name', 'John Doe')
      await page.fill('#nested-city', 'New York')
      await page.fill('#nested-zip', '10001')
      await page.click('#nested-button')

      await expect(page.locator('#nested-result')).toBeVisible()
      await expect(page.locator('#nested-result')).toContainText('"name":"John Doe"')
      await expect(page.locator('#nested-result')).toContainText('"city":"New York"')
      await expect(page.locator('#nested-result')).toContainText('"zip":"10001"')
    })

    test('it serializes arrays', async ({ page }) => {
      await page.goto('/use-http/nested-data')

      await page.fill('#nested-tags', 'tag1, tag2, tag3')
      await page.click('#nested-button')

      await expect(page.locator('#nested-result')).toBeVisible()
      await expect(page.locator('#nested-result')).toContainText('"tags":["tag1","tag2","tag3"]')
    })
  })

  test.describe('Mixed Content', () => {
    test('it uploads files with nested data using FormData', async ({ page }) => {
      await page.goto('/use-http/mixed-content')

      requests.listenForFinished(page)

      await page.fill('#mixed-title', 'My Document')
      await page.fill('#mixed-user-name', 'John Doe')
      await page.fill('#mixed-user-email', 'john@example.com')
      await page.fill('#mixed-tags', 'important, urgent, review')
      await page.setInputFiles('#mixed-document', {
        name: 'report.pdf',
        mimeType: 'application/pdf',
        buffer: Buffer.from('PDF content here'),
      })
      await page.click('#mixed-button')

      await expect(page.locator('#mixed-result')).toBeVisible()
      await expect(page.locator('#mixed-result')).toContainText('Files: 1')
      await expect(page.locator('#mixed-result')).toContainText('report.pdf')
      await expect(page.locator('#mixed-result')).toContainText('My Document')
      await expect(page.locator('#mixed-result')).toContainText('John Doe')
      await expect(page.locator('#mixed-result')).toContainText('john@example.com')

      const mixedRequest = requests.finished.find((r) => r.url().includes('/api/mixed'))
      expect(mixedRequest).toBeDefined()
      expect(mixedRequest?.headers()['content-type']).toContain('multipart/form-data')
    })

    test('it sends nested data without files as JSON', async ({ page }) => {
      await page.goto('/use-http/mixed-content')

      requests.listenForFinished(page)

      await page.fill('#mixed-title', 'No File Document')
      await page.fill('#mixed-user-name', 'Jane Doe')
      await page.fill('#mixed-user-email', 'jane@example.com')
      await page.fill('#mixed-tags', 'draft')
      await page.click('#mixed-button')

      await expect(page.locator('#mixed-result')).toBeVisible()
      await expect(page.locator('#mixed-result')).toContainText('Files: 0')
      await expect(page.locator('#mixed-result')).toContainText('No File Document')
      await expect(page.locator('#mixed-result')).toContainText('Jane Doe')

      const mixedRequest = requests.finished.find((r) => r.url().includes('/api/mixed'))
      expect(mixedRequest).toBeDefined()
      expect(mixedRequest?.headers()['content-type']).toContain('application/json')
    })
  })

  test.describe('Remember', () => {
    test('it remembers form state across navigation', async ({ page }) => {
      await page.goto('/use-http/remember')

      // Verify initial state
      await expect(page.locator('#current-values')).toContainText('Name: initial, Email:')

      // Modify form values
      await page.fill('#name', 'changed')
      await page.fill('#email', 'test@example.com')
      await expect(page.locator('#current-values')).toContainText('Name: changed, Email: test@example.com')
      await expect(page.locator('#is-dirty')).toContainText('isDirty: true')

      // Navigate away
      await page.click('#navigate-away')
      await page.waitForURL('/dump/get')

      // Navigate back
      await page.goBack()
      await page.waitForURL('/use-http/remember')

      // Verify form state was remembered
      await expect(page.locator('#current-values')).toContainText('Name: changed, Email: test@example.com')
    })
  })

  test.describe('Submit', () => {
    test('it submits using the Wayfinder endpoint', async ({ page }) => {
      await page.goto('/use-http/submit')

      await page.fill('#submit-name', 'John Doe')
      await page.fill('#submit-email', 'john@example.com')
      await page.click('#submit-button')

      await expect(page.locator('#submit-result')).toBeVisible()
      await expect(page.locator('#submit-result')).toContainText('Submit Success - ID: 123')
      await expect(page.locator('#submit-result')).toContainText('Name: John Doe')
      await expect(page.locator('#submit-result')).toContainText('Email: john@example.com')
    })

    test('it submits with explicit method and URL', async ({ page }) => {
      await page.goto('/use-http/submit')

      await page.fill('#submit-name', 'Jane Doe')
      await page.fill('#submit-email', 'jane@example.com')
      await page.click('#submit-method-button')

      await expect(page.locator('#submit-method-result')).toBeVisible()
      await expect(page.locator('#submit-method-result')).toContainText('PUT Success - ID: 99')
      await expect(page.locator('#submit-method-result')).toContainText('Name: Jane Doe')
      await expect(page.locator('#submit-method-result')).toContainText('Email: jane@example.com')
    })

    test('it submits with UrlMethodPair object', async ({ page }) => {
      await page.goto('/use-http/submit')

      await page.fill('#submit-name', 'Bob Smith')
      await page.fill('#submit-email', 'bob@example.com')
      await page.click('#submit-wayfinder-button')

      await expect(page.locator('#submit-wayfinder-result')).toBeVisible()
      await expect(page.locator('#submit-wayfinder-result')).toContainText('PATCH Success - ID: 88')
      await expect(page.locator('#submit-wayfinder-result')).toContainText('Name: Bob Smith')
      await expect(page.locator('#submit-wayfinder-result')).toContainText('Email: bob@example.com')
    })
  })
})
