import { expect, test } from '@playwright/test'
import { clickAndWaitForResponse } from './support'

test('can merge props', async ({ page }) => {
  await page.goto('/merge-props')

  await expect(page.getByText('bar count is 5')).toBeVisible()
  await expect(page.getByText('foo count is 5')).toBeVisible()

  await clickAndWaitForResponse(page, 'Reload', null, 'button')

  await expect(page.getByText('bar count is 5')).toBeVisible()
  await expect(page.getByText('foo count is 10')).toBeVisible()

  await clickAndWaitForResponse(page, 'Reload', null, 'button')

  await expect(page.getByText('bar count is 5')).toBeVisible()
  await expect(page.getByText('foo count is 15')).toBeVisible()

  await clickAndWaitForResponse(page, 'Get Fresh', null, 'button')

  await expect(page.getByText('bar count is 5')).toBeVisible()
  await expect(page.getByText('foo count is 5')).toBeVisible()

  await clickAndWaitForResponse(page, 'Reload', null, 'button')

  await expect(page.getByText('bar count is 5')).toBeVisible()
  await expect(page.getByText('foo count is 10')).toBeVisible()
})

test('can append to nested props', async ({ page }) => {
  await page.goto('/merge-nested-props/append')

  await expect(page.getByText('User 1, User 2, User 3')).toBeVisible()
  await expect(page.getByText('Page: 1, Per Page: 3')).toBeVisible()

  await clickAndWaitForResponse(page, 'Load More', '/merge-nested-props/append?page=2', 'button')

  await expect(page.getByText('User 1, User 2, User 3, User 4, User 5, User 6')).toBeVisible()
  await expect(page.getByText('Page: 2, Per Page: 3')).toBeVisible()

  await clickAndWaitForResponse(page, 'Load More', '/merge-nested-props/append?page=3', 'button')

  await expect(page.getByText('User 1, User 2, User 3, User 4, User 5, User 6, User 7, User 8, User 9')).toBeVisible()
  await expect(page.getByText('Page: 3, Per Page: 3')).toBeVisible()
})

test('can prepend to nested props', async ({ page }) => {
  await page.goto('/merge-nested-props/prepend')

  await expect(page.getByText('User 3, User 2, User 1')).toBeVisible()
  await expect(page.getByText('Page: 1, Per Page: 3')).toBeVisible()

  await clickAndWaitForResponse(page, 'Load More', '/merge-nested-props/prepend?page=2', 'button')

  await expect(page.getByText('User 6, User 5, User 4, User 3, User 2, User 1')).toBeVisible()
  await expect(page.getByText('Page: 2, Per Page: 3')).toBeVisible()

  await clickAndWaitForResponse(page, 'Load More', '/merge-nested-props/prepend?page=3', 'button')

  await expect(page.getByText('User 9, User 8, User 7, User 6, User 5, User 4, User 3, User 2, User 1')).toBeVisible()
  await expect(page.getByText('Page: 3, Per Page: 3')).toBeVisible()
})

test('can append to nested props with matchOn', async ({ page }) => {
  await page.goto('/merge-nested-props-with-match/append')

  await expect(
    page.getByText('User 1 - initial, User 2 - initial, User 3 - initial, User 4 - initial, User 5 - initial'),
  ).toBeVisible()
  await expect(page.getByText('Page: 1, Per Page: 5')).toBeVisible()

  await clickAndWaitForResponse(page, 'Load More', page.url() + '?page=2', 'button')

  await expect(
    page.getByText(
      'User 1 - initial, User 2 - initial, User 3 - initial, User 4 - subsequent, User 5 - subsequent, User 6 - subsequent, User 7 - subsequent, User 8 - subsequent',
    ),
  ).toBeVisible()
  await expect(page.getByText('Page: 2, Per Page: 5')).toBeVisible()
})

test('can prepend to nested props with matchOn', async ({ page }) => {
  await page.goto('/merge-nested-props-with-match/prepend')

  await expect(
    page.getByText('User 4 - initial, User 5 - initial, User 6 - initial, User 7 - initial, User 8 - initial'),
  ).toBeVisible()
  await expect(page.getByText('Page: 1, Per Page: 5')).toBeVisible()

  await clickAndWaitForResponse(page, 'Load More', page.url() + '?page=2', 'button')

  await expect(
    page.getByText(
      'User 1 - subsequent, User 2 - subsequent, User 3 - subsequent, User 4 - subsequent, User 5 - subsequent, User 6 - initial, User 7 - initial, User 8 - initial',
    ),
  ).toBeVisible()
  await expect(page.getByText('Page: 2, Per Page: 5')).toBeVisible()
})

test('can selectively merge nested props in complex object', async ({ page }) => {
  await page.goto('/complex-merge-selective')

  await expect(page.getByText('name is John')).toBeVisible()
  await expect(page.getByText('users: a, b, c')).toBeVisible()
  await expect(page.getByText('chat.data: 1, 2, 3')).toBeVisible()
  await expect(page.getByText('post.id: 1')).toBeVisible()
  await expect(page.getByText('post.comments.allowed: true')).toBeVisible()
  await expect(page.getByText('post.comments.data: A, B, C')).toBeVisible()

  await clickAndWaitForResponse(page, 'Reload', null, 'button')

  await expect(page.getByText('name is Jane')).toBeVisible()
  await expect(page.getByText('users: d, e, f')).toBeVisible()
  await expect(page.getByText('chat.data: 1, 2, 3, 4, 5, 6')).toBeVisible()
  await expect(page.getByText('post.id: 1')).toBeVisible()
  await expect(page.getByText('post.comments.allowed: false')).toBeVisible()
  await expect(page.getByText('post.comments.data: A, B, C, D, E, F')).toBeVisible()
})
