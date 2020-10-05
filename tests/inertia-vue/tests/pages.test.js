it('receives data from the controllers as props', async () => {
    await page.goto(HOST)

    const props = await page.evaluate(() => {
        const inertiaRoot = window.vm.$children[0]
        const page = inertiaRoot.$children[0]

        return page.$vnode.data.props
    })

    expect(props).toHaveProperty('example')
    expect(props.example).toMatch('FooBar')
})

it('can have a persistent layout via a render function', async () => {
    expect(true).toBe(false)
})

it('can have a persistent layout via the shorthand', async () => {
    expect(true).toBe(false)
})

it('can create more complex layout arrangements using nested layouts via the render function', async () => {
    expect(true).toBe(false)
})

it('can create more complex layout arrangements using nested layouts via the shorthand syntax', async () => {
    expect(true).toBe(false)
})
