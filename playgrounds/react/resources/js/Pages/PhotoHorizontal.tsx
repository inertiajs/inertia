import { Head, InfiniteScroll } from '@inertiajs/react'
import Image from '../Components/Image'
import Spinner from '../Components/Spinner'

const PhotoHorizontal = ({
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
      <Head title="Photo Grid (Horizontal)" />

      <div className="flex h-[200px] w-full overflow-x-scroll">
        <InfiniteScroll
          data="photos"
          buffer={1000}
          className="flex h-[200px] gap-6"
          preserveUrl
          onlyNext
          loading={
            <div className="flex size-[200px] items-center justify-center">
              <Spinner className="size-6 text-gray-400" />
            </div>
          }
        >
          {photos.data.map((photo) => (
            <Image key={photo.id} id={photo.id} url={photo.url} />
          ))}
        </InfiniteScroll>
      </div>
    </>
  )
}

export default PhotoHorizontal
