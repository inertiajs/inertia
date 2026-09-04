// Increments on render (not in an effect) because the fallback can be unmounted
// in the same commit it's created in -- an effect might never get the chance to fire.
const ClientOnlyFallback = () => {
  if (typeof window !== 'undefined') {
    window._inertia_client_only_fallback_renders = (window._inertia_client_only_fallback_renders || 0) + 1
  }

  return <p data-testid="client-only-fallback">Loading widget...</p>
}

export default ClientOnlyFallback
