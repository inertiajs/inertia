export function hasFiles(data: File|FileList|Blob|unknown): boolean {
  return (
    data instanceof File ||
    data instanceof Blob ||
    data instanceof FileList ||
    (data instanceof FormData && Array.from(data.values()).some((value) => hasFiles(value))) ||
    (typeof data === 'object' && data !== null && Object.values(data).find((value) => hasFiles(value)) !== undefined)
  )
}
