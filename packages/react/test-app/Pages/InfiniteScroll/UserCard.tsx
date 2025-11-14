export interface User {
  id: number
  name: string
}

export default ({ user }: { user: User }) => {
  return (
    <div
      data-user-id={user.id}
      style={{
        height: '15vh',
        border: '1px solid #ccc',
        backgroundColor: `rgba(150,150,150,${user.id / 40})`,
        color: 'green',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {user.name}
    </div>
  )
}
