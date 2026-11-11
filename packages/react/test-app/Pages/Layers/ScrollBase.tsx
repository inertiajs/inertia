export default () => {
  return (
    <>
      <div>Scroll base page</div>
      <div scroll-region="" id="base-region" style={{ height: 200, overflowY: 'auto', border: '1px solid #ccc' }}>
        <div style={{ height: 800 }}>Base scrollable content</div>
      </div>
    </>
  )
}
