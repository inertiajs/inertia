/**
 * Inertia v3 exposes a configurable HTTP client as `http`, but v2 has none.
 * Exported as `undefined` here so libraries supporting both majors can
 * feature-detect it with a truthy check: `if (http) http.getClient()`.
 */
export const http = undefined;
