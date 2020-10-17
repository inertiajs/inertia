describe('Pages', () => {
  it('receives data from the controllers as props', () => {
    cy.visit('/')

    cy.window().then(win => {
      const inertiaRoot = win.vm.$children[0]
      const page = inertiaRoot.$children[0]

      expect(page.$vnode.data.props).to.have.property('example')
      expect(page.$vnode.data.props.example).to.equal('FooBar')
    })
  })

  it('can have a persistent layout via a render function', async () => {
    expect(true).to.equal(false)
  })

  it('can have a persistent layout via the shorthand', async () => {
    expect(true).to.equal(false)
  })

  it('can create more complex layout arrangements using nested layouts via the render function', async () => {
    expect(true).to.equal(false)
  })

  it('can create more complex layout arrangements using nested layouts via the shorthand syntax', async () => {
    expect(true).to.equal(false)
  })
})
