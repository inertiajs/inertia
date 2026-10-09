import { expect, test } from '@playwright/test'
import { clickAndWaitForResponse, requests } from './support'

test.beforeEach(async ({ page }) => {
  await page.goto('/history/1')
})

test('it will not encrypt history by default', async ({ page }) => {
  const historyState1 = await page.evaluate(() => window.history.state)
  await expect(historyState1.page.component).toBe('History/Page')
  await expect(historyState1.page.props.pageNumber).toBe('1')
  await expect(page.getByText('This is page 1')).toBeVisible()

  await clickAndWaitForResponse(page, 'Page 2', '/history/2')
  const historyState2 = await page.evaluate(() => window.history.state)
  await expect(historyState2.page.component).toBe('History/Page')
  await expect(historyState2.page.props.pageNumber).toBe('2')
  await expect(page.getByText('This is page 2')).toBeVisible()

  requests.listen(page)

  await page.goBack()
  await page.waitForURL('/history/1')
  await expect(page.getByText('This is page 1')).toBeVisible()
  await expect(requests.requests).toHaveLength(0)

  await page.goForward()
  await page.waitForURL('/history/2')
  await expect(page.getByText('This is page 2')).toBeVisible()
  await expect(requests.requests).toHaveLength(0)
})

test('it can encrypt history', async ({ page }) => {
  await clickAndWaitForResponse(page, 'Page 3', '/history/3')
  // When history is encrypted, the page is an ArrayBuffer,
  // but Playwright doesn't transfer it as such over the wire (page.evaluate),
  // so if the object is "empty" and the page check below works, it's working.
  await expect
    .poll(async () => {
      const state = await page.evaluate(() => window.history.state)
      return state.page
    })
    .toEqual({})

  requests.listen(page)

  await page.goBack()
  await page.waitForURL('/history/1')
  await expect(page.getByText('This is page 1')).toBeVisible()
  await expect(requests.requests).toHaveLength(0)

  // Double check that this history state did not get encrypted
  const historyState1 = await page.evaluate(() => window.history.state)
  await expect(historyState1.page.component).toBe('History/Page')
  await expect(historyState1.page.props.pageNumber).toBe('1')

  await page.goForward()
  await page.waitForURL('/history/3')
  await expect
    .poll(async () => {
      const state = await page.evaluate(() => window.history.state)
      return state.page
    })
    .toEqual({})
  await expect(page.getByText('This is page 3')).toBeVisible()
  await expect(requests.requests).toHaveLength(0)
})

test('history can be cleared via router', async ({ page }) => {
  await clickAndWaitForResponse(page, 'Page 3', '/history/3')

  await page.waitForTimeout(200)

  await page.goBack()
  await page.waitForURL('/history/1')

  await page.getByRole('button', { name: 'Clear History' }).click()

  requests.listen(page)

  await page.goForward()
  await page.waitForURL('/history/3')
  await expect(page.getByText('This is page 3')).toBeVisible()
  await expect(requests.requests).toHaveLength(1)

  await page.goBack()
  await page.waitForURL('/history/1')
  // Should be the same, non-encrypted history state doesn't get cleared
  await expect(requests.requests).toHaveLength(1)

  await page.goForward()
  await page.waitForURL('/history/3')
  await expect(requests.requests).toHaveLength(1)
})

test('history can be cleared via props', async ({ page }) => {
  await clickAndWaitForResponse(page, 'Page 3', '/history/3')
  await clickAndWaitForResponse(page, 'Page 4', '/history/4')

  requests.listen(page)

  await page.goBack()
  await page.waitForURL('/history/3')
  await expect(page.getByText('This is page 3')).toBeVisible()
  await expect(requests.requests).toHaveLength(1)

  await page.goBack()
  await page.waitForURL('/history/1')
  // Should be the same, non-encrypted history state doesn't get cleared
  await expect(requests.requests).toHaveLength(1)

  await page.goForward()
  await page.waitForURL('/history/3')
  await expect(requests.requests).toHaveLength(1)
})

test('it does not restore prefetched pages after history is cleared', async ({ page }) => {
  await page.goto('/history/prefetch/home')

  const prefetch = page.waitForResponse('/history/prefetch/dashboard')
  await page.getByRole('link', { name: 'Dashboard' }).hover()
  await prefetch

  await page.getByRole('link', { name: 'Dashboard' }).click()
  await expect(page.getByText('This is the dashboard page.')).toBeVisible()

  await clickAndWaitForResponse(page, 'Sign out', '/history/prefetch/signed-out')
  await expect(page.getByText('This is the signed-out page.')).toBeVisible()

  requests.listen(page)

  await page.goBack()
  await page.waitForURL('/history/prefetch/dashboard')
  await expect(page.getByText('This is the dashboard page.')).toBeVisible()
  await expect(requests.requests).toHaveLength(1)
})

test('it does not cache prefetches that are still in flight when history is cleared', async ({ page }) => {
  await page.goto('/history/prefetch/home')

  const prefetchRequest = page.waitForRequest('/history/prefetch/reports')
  const prefetchResponse = page.waitForResponse('/history/prefetch/reports')
  await page.getByRole('link', { name: 'Reports' }).hover()
  await prefetchRequest

  await clickAndWaitForResponse(page, 'Sign out', '/history/prefetch/signed-out')
  await expect(page.getByText('This is the signed-out page.')).toBeVisible()
  await prefetchResponse

  requests.listen(page)

  await page.getByRole('link', { name: 'Reports' }).click()
  await expect(page.getByText('This is the reports page.')).toBeVisible()

  // The hover timer still fires a prefetch after the click, so only count regular visits
  const visits = requests.requests.filter((request) => request.headers().purpose !== 'prefetch')
  await expect(visits).toHaveLength(1)
})

test('multi byte strings can be encrypted', async ({ page }) => {
  await clickAndWaitForResponse(page, 'Page 5', '/history/5')

  // Check that the history state has a 'page' key
  const historyState5Keys = await page.evaluate(() => Object.keys(window.history.state))
  await expect(historyState5Keys).toContain('page')

  // When history is encrypted, the page is an ArrayBuffer,
  // but Playwright doesn't transfer it as such over the wire (page.evaluate),
  // so if the object is "empty" and the page check below works, it's working.
  const historyState5Page = await page.evaluate(() => window.history.state.page)
  await expect(historyState5Page).toEqual({})

  await expect(page.getByText('Multi byte character: 😃')).toBeVisible()

  await clickAndWaitForResponse(page, 'Page 1', '/history/1')

  await expect(page.getByText('Multi byte character: n/a')).toBeVisible()

  requests.listen(page)

  await page.goBack()
  await page.waitForURL('/history/5')
  await expect(page.getByText('This is page 5')).toBeVisible()
  await expect(requests.requests).toHaveLength(0)
  await expect(page.getByText('Multi byte character: 😃')).toBeVisible()
})

test('url will update after scrolling and pressing back', async ({ page }) => {
  // Weird bug that surfaced after setting scroll restoration to manual
  await page.waitForURL('/history/1')
  await clickAndWaitForResponse(page, 'Page 5', '/history/5')
  await page.evaluate(() => (window as any).scrollTo(0, 1000))
  await page.goBack()
  await page.waitForURL('/history/1')
  await page.waitForTimeout(200)
  await page.waitForURL('/history/1')
})

test('it handles bfcache restoration after history is cleared', async ({ page }) => {
  await clickAndWaitForResponse(page, 'Page 3', '/history/3')
  await expect(page.getByText('This is page 3')).toBeVisible()

  // Simulate clearHistory removing the encryption keys
  await page.evaluate(() => {
    window.sessionStorage.removeItem('historyKey')
    window.sessionStorage.removeItem('historyIv')
  })

  requests.listen(page)

  // Simulate bfcache restoration
  await page.evaluate(() => {
    window.dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true }))
  })

  await page.waitForTimeout(1000)
  expect(requests.requests.length).toBeGreaterThan(0)
})

test('it does not leak cleared history entries through a known plaintext', async ({ page }) => {
  // User A opens the public page, which looks the same for every user. The page is encrypted,
  // so its entry is stored as ciphertext in window.history.state.
  await page.goto('/encrypted-history/public')
  await expect(page.getByRole('heading', { name: 'Public page' })).toBeVisible()

  // User A then opens the private page. Its token is random on every request, so nobody but
  // A has ever seen this exact token. This entry is encrypted with the same key as the first.
  const privateResponse = page.waitForResponse('/encrypted-history/private')
  await page.getByRole('link', { exact: true, name: 'Private page' }).click()
  await privateResponse
  await expect(page.getByRole('heading', { name: 'Private page' })).toBeVisible()

  const tokenOfUserA = await page.locator('#token').textContent()

  expect(tokenOfUserA).toMatch(/^[0-9a-f-]{36}$/)

  // User A logs out. The logout page responds with clearHistory, which removes the encryption
  // key and IV from sessionStorage, so A's two entries can no longer be decrypted. The entries
  // themselves stay in the browser history as ciphertext.
  const logoutResponse = page.waitForResponse('/encrypted-history/logout')
  await page.getByRole('link', { exact: true, name: 'Log out' }).click()
  await logoutResponse

  // Inertia clears the key before it renders the logout page, so once it's visible the key is gone
  await expect(page.getByRole('heading', { name: 'Logged out' })).toBeVisible()

  const keyAfterLogout = await page.evaluate(() => window.sessionStorage.getItem('historyKey'))

  expect(keyAfterLogout).toBeNull()

  // User B now sits down at the same browser. Going back to the private page makes Inertia try
  // to decrypt A's entry. That fails, so Inertia visits the server to replace the entry with a
  // fresh page. Going offline first makes that visit fail, so A's ciphertext stays in place.
  await page.context().setOffline(true)

  await page.goBack()
  await page.waitForURL('/encrypted-history/private')

  // Copy the raw ciphertext of A's private page out of history.state
  const privateEntryOfUserA = await page.evaluate(() => {
    const entry = window.history.state.page

    return entry instanceof ArrayBuffer ? Array.from(new Uint8Array(entry)) : null
  })

  expect(privateEntryOfUserA).not.toBeNull()

  await page.goBack()
  await page.waitForURL('/encrypted-history/public')

  // Copy the raw ciphertext of A's public page as well
  const publicEntryOfUserA = await page.evaluate(() => {
    const entry = window.history.state.page

    return entry instanceof ArrayBuffer ? Array.from(new Uint8Array(entry)) : null
  })

  expect(publicEntryOfUserA).not.toBeNull()

  // Back online, B opens the public page as themselves. Because it looks the same for every
  // user, B now knows the exact plaintext that is hidden inside A's public page entry.
  await page.context().setOffline(false)
  await page.goto('/encrypted-history/public')

  // B's own entry is encrypted under a brand new key. Inertia writes the entry to history.state
  // before it renders the page, so once the page is visible B can decrypt it with that key,
  // which is allowed since it's B's own entry.
  await expect(page.getByRole('heading', { name: 'Public page' })).toBeVisible()

  const publicPlaintext = await page.evaluate(async () =>
    JSON.stringify(await (window as any).testing.Inertia.decryptHistory()),
  )

  expect(publicPlaintext).toContain('"title":"Public page"')

  // The attack. A's two entries were encrypted with the same key and IV, so both were mixed
  // with the same keystream S: the private entry is P_private xor S, and the public entry is
  // P_public xor S. XORing the two entries cancels S out and leaves P_private xor P_public.
  // XORing in the known P_public then leaves P_private, without ever knowing the key.
  const publicBytes = new TextEncoder().encode(publicPlaintext)
  const recoveredBytes = new Uint8Array(publicBytes.length)

  for (let index = 0; index < publicBytes.length; index++) {
    recoveredBytes[index] = publicBytes[index] ^ publicEntryOfUserA![index] ^ privateEntryOfUserA![index]
  }

  const recovered = new TextDecoder().decode(recoveredBytes)

  console.log({ recovered })

  // With a fresh IV for every entry, the two keystreams differ and this is just noise. With a
  // shared IV, it contains A's private page, including the token that only A has seen.
  expect(recovered).not.toContain(tokenOfUserA)
})

test('it fetches history entries that an earlier version encrypted with a shared IV from the server', async ({
  page,
}) => {
  await page.goto('/encrypted-history/public')
  await expect(page.getByRole('heading', { name: 'Public page' })).toBeVisible()

  // Rewrite the current entry the way earlier versions stored it: one shared IV in
  // sessionStorage, and the ciphertext without an IV in front of it
  const earlierKey = await page.evaluate(async () => {
    const currentPage = await (window as any).testing.Inertia.decryptHistory()
    const rawKey = new Uint8Array(JSON.parse(window.sessionStorage.getItem('historyKey')!))
    const key = await window.crypto.subtle.importKey('raw', rawKey, 'AES-GCM', false, ['encrypt'])
    const sharedIv = window.crypto.getRandomValues(new Uint8Array(12))
    const legacyEntry = await window.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: sharedIv },
      key,
      new TextEncoder().encode(JSON.stringify(currentPage)),
    )

    window.sessionStorage.setItem('historyIv', JSON.stringify(Array.from(sharedIv)))
    window.history.replaceState({ ...window.history.state, page: legacyEntry }, '', window.location.href)

    return window.sessionStorage.getItem('historyKey')
  })

  await clickAndWaitForResponse(page, 'Private page', '/encrypted-history/private')
  await expect(page.getByRole('heading', { name: 'Private page' })).toBeVisible()

  const storageAfterUpgrade = await page.evaluate(() => ({
    key: window.sessionStorage.getItem('historyKey'),
    iv: window.sessionStorage.getItem('historyIv'),
  }))

  expect(storageAfterUpgrade.key).not.toBeNull()
  expect(storageAfterUpgrade.key).not.toBe(earlierKey)
  expect(storageAfterUpgrade.iv).toBeNull()

  const publicResponse = page.waitForResponse('/encrypted-history/public')
  await page.goBack()
  await publicResponse

  await expect(page).toHaveURL('/encrypted-history/public')
  await expect(page.getByRole('heading', { name: 'Public page' })).toBeVisible()
})

test('will pull from server if history version is different than current version when pressing back', async ({
  page,
}) => {
  await page.goto('/history/version/1')
  await page.waitForURL('/history/version/1')
  await clickAndWaitForResponse(page, 'Page 2', '/history/version/2')

  requests.listen(page)

  await page.goBack()
  await page.waitForURL('/history/version/1')
  await page.waitForTimeout(200)
  await expect(requests.requests).toHaveLength(1)
})
