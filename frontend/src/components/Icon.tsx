// Ícones do Material Symbols (fonte carregada no index.html), os mesmos do
// protótipo do painel do admin. `name` é o nome do ícone, ex: "groups".
export function Icon({
  name,
  className = "",
  filled = false,
}: {
  name: string;
  className?: string;
  filled?: boolean;
}) {
  return (
    <span
      aria-hidden="true"
      className={`material-symbols-outlined ${filled ? "icon-fill" : ""} ${className}`}
    >
      {name}
    </span>
  );
}
