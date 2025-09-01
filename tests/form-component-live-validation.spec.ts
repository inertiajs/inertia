import test, { expect } from '@playwright/test'
import { consoleMessages, pageLoads } from './support'

// These tests target the Vue 3 adapter demo page:
// /packages/vue3/test-app/Pages/FormComponent/LiveValidation.vue
// Route: /form-component/live-validation -> component: FormComponent/LiveValidation

test.describe('Form Component - Live Validation (Vue 3)', () => {
  test.beforeEach(async () => {
    test.skip(process.env.PACKAGE !== 'vue3', 'Live validation tests are Vue 3-specific')
  })

  test('provider: validates on input for opted-in field and sets/clears errors', async ({ page }) => {
    pageLoads.watch(page)
    await page.goto('/form-component/live-validation')
    const name = page.locator('#name')
    const nameErr = page.locator('#error_name')

    await expect(nameErr).toHaveText('')

    // Trigger invalid, then valid
    await name.type('Jo')
    await page.waitForTimeout(180)
    await expect(nameErr).toHaveText('Name must be at least 3 characters.')

    await name.type('hn') // total: 'John'
    await page.waitForTimeout(180)
    await expect(nameErr).toHaveText('')
  })

  test('provider: global precognitive validates on input', async ({ page }) => {
    pageLoads.watch(page)
    await page.goto('/form-component/live-validation')
    const gpName = page.locator('#gp_name')
    const gpErr = page.locator('#gp_error_name')

    await expect(gpErr).toHaveText('')

    await gpName.type('Jo')
    await page.waitForTimeout(180)
    await expect(gpErr).toHaveText('Name must be at least 3 characters.')

    await gpName.type('hn')
    await page.waitForTimeout(180)
    await expect(gpErr).toHaveText('')
  })

  test('provider: non-opted field does not trigger validation', async ({ page }) => {
    pageLoads.watch(page)
    await page.goto('/form-component/live-validation')
    const email = page.locator('#email')
    await email.type('invalid-email')
    await page.waitForTimeout(200)
    await expect(page.locator('#error_email')).toHaveText('')
  })

  test('provider: validate latest input yields final valid result', async ({ page }) => {
    pageLoads.watch(page)
    await page.goto('/form-component/live-validation')
    const gpName = page.locator('#gp_name')
    const gpErr = page.locator('#gp_error_name')

    await gpName.fill('Jo') // invalid
    await page.waitForTimeout(140)
    await gpName.type('hn') // becomes valid

    await page.waitForTimeout(200)
    await expect(gpErr).toHaveText('')
  })

  test('provider detection: warns when precognitive is true but no provider present', async ({ page }) => {
    consoleMessages.listen(page)
    pageLoads.watch(page)
    await page.goto('/form-component/live-validation-no-provider')

    const npName = page.locator('#np_name')
    await npName.type('A')

    await page.waitForTimeout(200)

    const messages = consoleMessages.messages
    const found = messages.some((m) =>
      m.includes('[Inertia][Form] precognitive live validation requested but no provider found.'),
    )

    expect(found).toBeTruthy()
  })
})
