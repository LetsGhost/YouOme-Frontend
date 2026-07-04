export function LoadingScreen({ label = "Settling up..." }: { label?: string }) {
  return (
    <div className="loading-screen">
      <div className="loading-coin">€</div>
      <div className="loading-label">{label}</div>
    </div>
  );
}
