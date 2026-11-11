export default ({ note, errors }: { note: string; errors: Record<string, string> }) => (
  <>
    <div>Local layer</div>
    <div id="local-note">{note}</div>
    <div id="local-errors">{typeof errors}</div>
  </>
)
