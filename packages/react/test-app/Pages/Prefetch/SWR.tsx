import SWRLayout from '@/Layouts/SWR'

const SWR = ({ pageNumber, lastLoaded }: { pageNumber: string; lastLoaded: number }) => {
  return (
    <div>
      <div>This is page {pageNumber}</div>
      <div>
        Last loaded at <span id="last-loaded">{lastLoaded}</span>
      </div>
    </div>
  )
}

SWR.layout = (page: React.ReactNode) => <SWRLayout children={page} />

export default SWR
