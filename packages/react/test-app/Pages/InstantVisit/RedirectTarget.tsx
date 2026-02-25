export default ({ redirected }: { redirected: boolean }) => {
  return (
    <div>
      <div id="redirect-target">This is RedirectTarget</div>
      <div id="redirected">Redirected: {String(redirected)}</div>
    </div>
  )
}
