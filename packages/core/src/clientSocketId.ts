let clientId: string | null = null

/**
 * A stable id for this client, for a broadcaster that issues none of its own.
 * The server sends it back on a broadcast so the client that caused the event
 * can drop it, which is how `toOthers` is earned without server side exclusion.
 */
export const clientSocketId = (): string => {
  if (clientId === null) {
    clientId = globalThis.crypto?.randomUUID?.() ?? `inertia-${Date.now()}-${Math.random().toString(36).slice(2)}`
  }

  return clientId
}
