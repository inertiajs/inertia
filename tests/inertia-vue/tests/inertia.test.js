it('mounts the initial page', async () => {
    await page.goto(HOST)

    const view = await page.evaluate(() => document.querySelector('body > div:first-child').innerHTML)

    expect(view.trim()).toMatch('Hello World!')
})

it('has the $inertia app injected into page component', async () => {
    await page.goto(HOST)

    const $inertia = await page.evaluate(() => {
        const inertiaRoot = window.vm.$children[0]
        const page = inertiaRoot.$children[0]

        return page.$inertia
    })

    expect($inertia).toHaveProperty('init')
    expect($inertia).toHaveProperty('resolveComponent')
    expect($inertia).toHaveProperty('page')
})

it('has inertia props injected into the page component', async () => {
    await page.goto(HOST)

    const props = await page.evaluate(() => {
        const inertiaRoot = window.vm.$children[0]
        const page = inertiaRoot.$children[0]

        return page.$vnode.data.props
    })

    expect(props).toHaveProperty('example')
    expect(props.example).toMatch('FooBar')
})

it('has the $page helper injected into the Vue component', async () => {
    await page.goto(HOST)

    const [$page, $inertia] = await page.evaluate(() => {
        const inertiaRoot = window.vm.$children[0]
        const page = inertiaRoot.$children[0]

        return [page.$page, page.$inertia]
    })

    expect($page).toStrictEqual($inertia.page.props)
})
