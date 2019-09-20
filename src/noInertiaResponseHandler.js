import Modal from './modal'

export default function({ status, statusText, data, headers = {}, request}) {
  Modal.show(data)
}
