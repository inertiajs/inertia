import Modal from '../src/modal'

it('shows modal', () => {
  Modal.show('<p>Hello World</p>')

  expect(Modal.modal).toMatchSnapshot()
})

it('displays html content', () => {
  Modal.show('<p>Hello World</p>')

  const iframe = Modal.modal.firstChild

  expect(iframe.contentDocument.body.innerHTML).toBe('<p>Hello World</p>')
})
