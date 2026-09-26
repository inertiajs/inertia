export default () => {
  return (
    <>
      <div>Scroll layer</div>
      <div scroll-region="" id="layer-region" style={{ height: 200, overflowY: 'auto', border: '1px solid #ccc' }}>
        <div style={{ height: 800 }}>Layer scrollable content</div>
      </div>
    </>
  )
}
