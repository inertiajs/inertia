// Plain counters rather than $state: both components read them while rendering, which is
// the only moment the tests care about
export const counts = { fallbackRenders: 0, childMounts: 0 }
