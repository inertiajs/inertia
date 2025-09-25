import { Head, InfiniteScroll } from '@inertiajs/react'
import Layout from '../Components/Layout'
import Image from '../Components/Image'
import Spinner from '../Components/Spinner'

const PhotoHorizontal = ({ photos = { data: [] } }: {
  photos?: {
    data: {
      id: number
      url: string
    }[]
  }
}) => {
  return (
    <>
      <Head title="Photo Grid (Horizontal)" />
      <div className="flex h-[200px] w-screen overflow-x-scroll">
        <InfiniteScroll data="photos" buffer={1000} className="flex h-[200px] gap-6">
          {({ loadingPrevious, loadingNext }) => (
            <>
              {photos.data.map((photo) => (
                <Image key={photo.id} id={photo.id} url={photo.url} />
              ))}

              {(loadingPrevious || loadingNext) && (
                <div className={`flex justify-center ${loadingPrevious ? 'py-16' : 'py-16'}`}>
                  <Spinner className="size-6 text-gray-400" />
                </div>
              )}
            </>
          )}
        </InfiniteScroll>
      </div>
    </>
  )
}

PhotoHorizontal.layout = (page: React.ReactElement) => <Layout>{page}</Layout>

export default PhotoHorizontal