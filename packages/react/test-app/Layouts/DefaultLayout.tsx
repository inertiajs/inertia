export default ({
  children,
  baseChrome,
  layerChrome,
  name,
}: {
  children: React.ReactNode
  baseChrome?: string
  layerChrome?: string
  name?: string
}) => {
  return (
    <div id="default-layout">
      <span>Default Layout</span>
      <div id="base-chrome">{baseChrome ?? ''}</div>
      <div id="layer-chrome">{layerChrome ?? ''}</div>
      <div id="layout-name">{name ?? ''}</div>
      {children}
    </div>
  )
}
