export function ErrorMessage({ errorMsg }) {
  return (
    <p className="msg">
      <span>⛔️</span> {errorMsg}
    </p>
  );
}
