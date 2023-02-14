import { Head, Link } from '@inertiajs/react'
import Layout from '../Components/Layout'

const Home = () => {
  return (
    <>
      <Head title="Home" />
      <h1 className="text-3xl">Home</h1>
      <p className="mt-6">
        <Link href="/article#far-down" className="text-blue-700 underline">
          Link to bottom of article page
        </Link>
      </p>
    </>
  )
}

Home.layout = (page) => <Layout children={page} />

export default Home
