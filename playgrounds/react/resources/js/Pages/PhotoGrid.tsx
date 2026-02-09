import { Head, InfiniteScroll } from '@inertiajs/react'
import Image from '../Components/Image'
import Layout from '../Components/Layout'
import Spinner from '../Components/Spinner'

const PhotoGrid = ({
  photos,
}: {
  photos: {
    data: {
      id: number
      url: string
    }[]
  }
}) => {
  return (
    <>
      <Head title="Photo Grid" />

      <InfiniteScroll
        data="photos"
        className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        buffer={1000}
        loading={
          <div className="flex justify-center py-16">
            <Spinner className="size-6 text-gray-400" />
          </div>
        }
      >
        {photos.data.map((photo) => (
          <Image key={photo.id} id={photo.id} url={photo.url} />
        ))}
      </InfiniteScroll>
    </>
  )
}

PhotoGrid.layout = Layout

export default PhotoGrid
