import { Head } from '@inertiajs/react'
import Layout from '../Components/Layout'

const Defer = ({ users, foods, organizations}: {
  users?: {
    id: number
    name: string
    email: string
  }[]
  organizations?: {
    id: number
    name: string
    url: string
  }[]
  foods?: {
    id: number
    name: string
  }[] }) => {

  return (
    <>
      <Head title="Form" />
      <h1 className="text-3xl">Defer</h1>
        <div className="p-4 mt-6 bg-yellow-200 border border-yellow-500 rounded">
            <p>Page is loaded!</p>
        </div>

        <div className="flex mt-6 space-x-6">
            <div className="w-1/2 p-4 border border-black rounded">
            {/* <Deferred data={users} fallback={() => <p>Loading Users...</p>}> */}
            {users ? users.map(user => (
                <div key={user.id}>
                <p>#{ user.id }: {user.name } ({ user.email })</p>
                </div>
            )) : <p>Loading Users...</p>}
            {/* </Deferred> */}
            </div>

            <div className="w-1/2 p-4 border border-black rounded">
                {/* <Deferred data={foods} fallback={() => <p>Loading Foods...</p>}> */}
                {foods ?foods.map(food => (
                <div key={food.id}>
                    <p>#{ food.id }: {food.name }</p>
                </div>
                )) : <p>Loading Foods...</p>}
                {/* </Deferred> */}
            </div>

            <div className="w-1/2 p-4 border border-black rounded">
            {/* <Deferred data={organizations} fallback={() => <p>Loading Organizations...</p>}> */}
            {organizations ? organizations.map(org => (
                <div key={org.id}>
                    <p>#{ org.id }: {org.name } ({ org.url })</p>
                </div>
            )) : <p>Loading Organizations...</p>}
            {/* </Deferred> */}
            </div>
        </div>
    </>
  )
}

Defer.layout = (page) => <Layout children={page} />

export default Defer
