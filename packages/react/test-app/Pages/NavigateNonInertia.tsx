export default () => {
  function navigate(e: React.MouseEvent) {
    e.preventDefault()
    window.history.replaceState({ foo: {} }, '')
    window.location.href = '/non-inertia'
  }

  return (
    <div>
      <h1>Navigate Non-Inertia</h1>
      <p>
        <a href="/non-inertia" onClick={navigate}>
          Go to non-Inertia page
        </a>
      </p>
    </div>
  )
}
