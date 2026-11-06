import { useEffect, useState } from 'react'

export default function PreserveEqualPropsLayout({
  file,
  children,
}: {
  file: { url: string; pages: number }
  children: React.ReactNode
}) {
  const [layoutEffectCount, setLayoutEffectCount] = useState(0)

  useEffect(() => {
    setLayoutEffectCount((count) => count + 1)
  }, [file])

  return (
    <div>
      <p id="layout-effect-count">Layout effect count: {layoutEffectCount}</p>
      {children}
    </div>
  )
}
