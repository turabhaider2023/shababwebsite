export default function Stars({ value = 0 }) {
  const full = Math.max(0, Math.min(5, Math.round(Number(value) || 0)));
  return (
    <span className="stars" aria-label={`${Number(value) || 0} out of 5 stars`}>
      <span>{'★★★★★'.slice(0, full)}</span>
      <span className="dim">{'★★★★★'.slice(full)}</span>
    </span>
  );
}
