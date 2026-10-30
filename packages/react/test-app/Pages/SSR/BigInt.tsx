export default ({ big, nested }: { big: bigint; nested: { deep: bigint[] } }) => (
  <div>
    <h1 data-testid="ssr-title">SSR Big Integers</h1>

    <p data-testid="big">big: {String(big)}</p>
    <p data-testid="big-type">type: {typeof big}</p>
    <p data-testid="nested">nested: {nested.deep.map(String).join(',')}</p>
  </div>
)
