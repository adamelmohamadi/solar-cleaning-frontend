export default function EmptyState({
  message = "Aucune donnée disponible",
}) {
  return (
    <div
      style={{
        padding: "30px",
        textAlign: "center",
      }}
    >
      {message}
    </div>
  );
}