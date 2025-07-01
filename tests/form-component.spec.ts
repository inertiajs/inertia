import test, { expect } from '@playwright/test'
import { pageLoads, shouldBeDumpPage } from './support'

test.describe('Form Component', () => {
  test.skip(process.env.PACKAGE !== 'vue3', 'Currently only implemented for Vue 3')

  test.describe('Elements', () => {
    test.beforeEach(async ({ page }) => {
      pageLoads.watch(page)
      page.goto('/form-component/elements')
    })

    test('can submit the form with the default values', async ({ page }) => {
      await page.getByRole('button', { name: 'Submit' }).click()
      const dump = await shouldBeDumpPage(page, 'post')

      await expect(dump.method).toEqual('post')
      await expect(dump.files).toEqual({})
      await expect(dump.query).toEqual({})
      await expect(dump.form).toEqual({
        name: '',
        country: 'uk',
        bio: '',
        token: 'abc123',
        age: '',
        user: { address: { street: '' } },
        items: [{ name: 'Item A' }, { name: 'Item B' }],
      })
    })

    test('can submit the form with filled values', async ({ page }) => {
      await page.fill('#name', 'Joe')
      await page.selectOption('#country', 'us')
      await page.selectOption('#role', 'User')
      await page.check('input[name="plan"][value="pro"]')
      await page.check('#subscribe')
      await page.check('input[name="interests[]"][value="sports"]')
      await page.check('input[name="interests[]"][value="music"]')
      await page.selectOption('#skills', ['vue', 'react'])
      await page.setInputFiles('#avatar', {
        name: 'avatar.jpg',
        mimeType: 'image/jpeg',
        buffer: Buffer.from('fake image data'),
      })
      await page.setInputFiles('#documents', [
        { name: 'doc1.pdf', mimeType: 'application/pdf', buffer: Buffer.from('fake pdf data 1') },
        { name: 'doc2.pdf', mimeType: 'application/pdf', buffer: Buffer.from('fake pdf data 2') },
      ])
      await page.fill('#bio', 'This is a bio.')
      await page.fill('#age', '30')
      await page.fill('#nested_street', '123 Main St')
      await page.fill('#item_a', 'Item 1')
      await page.fill('#item_b', 'Item 2')

      await page.getByRole('button', { name: 'Submit' }).click()
      const dump = await shouldBeDumpPage(page, 'post')

      await expect(dump.method).toEqual('post')
      await expect(dump.query).toEqual({})
      await expect(dump.files).toEqual([
        {
          fieldname: 'avatar',
          originalname: 'avatar.jpg',
          mimetype: 'image/jpeg',
          buffer: { type: 'Buffer', data: expect.any(Array) },
          encoding: '7bit',
          size: 15,
        },
        {
          fieldname: 'documents[0]',
          originalname: 'doc1.pdf',
          mimetype: 'application/pdf',
          buffer: { type: 'Buffer', data: expect.any(Array) },
          encoding: '7bit',
          size: 15,
        },
        {
          fieldname: 'documents[1]',
          originalname: 'doc2.pdf',
          mimetype: 'application/pdf',
          buffer: { type: 'Buffer', data: expect.any(Array) },
          encoding: '7bit',
          size: 15,
        },
      ])

      await expect(dump.form).toEqual({
        name: 'Joe',
        country: 'us',
        role: 'User',
        plan: 'pro',
        subscribe: 'yes',
        interests: ['sports', 'music'],
        skills: ['vue', 'react'],
        bio: 'This is a bio.',
        token: 'abc123',
        age: '30',
        user: { address: { street: '123 Main St' } },
        items: [{ name: 'Item 1' }, { name: 'Item 2' }],
      })
    })

    test('can check if the form is dirty', async ({ page }) => {
      await expect(page.getByText('Form is clean')).toBeVisible()
      await page.fill('#name', 'Joe')
      await expect(page.locator('#name')).toHaveValue('Joe')
      await expect(page.getByText('Form is dirty')).toBeVisible()
      await page.getByRole('button', { name: 'Reset' }).click()
      await expect(page.getByText('Form is clean')).toBeVisible()
      await expect(page.locator('#name')).toHaveValue('')
    })
  })
})
