export default ({ status }: { status: number }) => {
  return (
    <div>
      <h1>Error Page</h1>
      <p id="status">{status}</p>
    </div>
  )
}
