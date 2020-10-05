it('visits a different inertia page using the inertia-link component', async () => {
    await page.goto(HOST + '/links')

    // Fail the assertion when a hard visit / location visit is made.
    // Inertia's SPA-visit should not trigger this.
    page.on('load', () => expect(true).toBe(false))

    // Click on our Inertia-link
    const link = await page.$('[href="/links-target-1"]')
    await link.click()

    // Wait for the page to change
    await page.waitForSelector('[href="/links"]')

    // Detect that the page has successfully changed
    expect(page.url()).toBe(HOST + '/links-target-1')

    const view = await page.evaluate(() => document.querySelector('body > div:first-child > span').innerHTML)
    expect(view).toMatch('This is one of the links target page')
})
