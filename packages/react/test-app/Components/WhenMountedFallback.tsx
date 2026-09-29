import { counts } from './whenMountedCounts'

const WhenMountedFallback = () => {
  // Counts on render, not in an effect, since the fallback can unmount in the same commit
  counts.fallbackRenders++

  return <p id="when-mounted-fallback">Loading widget...</p>
}

export default WhenMountedFallback
