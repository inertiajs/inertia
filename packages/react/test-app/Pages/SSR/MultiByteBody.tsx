export default ({ text }: { text: string }) => (
  <div>
    <h1 data-testid="ssr-title">SSR Multi-Byte Body</h1>
    <p data-testid="character-count">Characters: {text.length}</p>
    <p data-testid="replacement-count">Replacement characters: {(text.match(/�/g) || []).length}</p>
    <p data-testid="text">{text}</p>
  </div>
)
