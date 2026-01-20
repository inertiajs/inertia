export default ({ message }: { message: string }) => (
  <div>
    <h1 data-testid="ssr-title">SSR Page With Script Element</h1>
    <p data-testid="message">{message}</p>
  </div>
)
