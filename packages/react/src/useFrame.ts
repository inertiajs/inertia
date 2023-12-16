import { useContext } from 'react'
import FrameContext from './FrameContext'

export default function useFrame(): any {
  return useContext(FrameContext)
}
