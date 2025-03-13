import Prefetch from '@/Layouts/Prefetch'

const Page = ({ pageNumber, lastLoaded }) => {
  return (
    <div>
      <div>This is page {pageNumber}</div>
      <div>
        Last loaded at <span id="last-loaded">{lastLoaded}</span>
      </div>
    </div>
  )
}

Page.layout = (page) => <Prefetch children={page} />

export default Page
