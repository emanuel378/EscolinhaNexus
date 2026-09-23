interface SpinnerProps {
  size?: "sm" | "md";
}

export function Spinner({ size = "sm" }: SpinnerProps) {
  const dimension = size === "sm" ? "h-4 w-4" : "h-8 w-8";

  return (
    <span
      className={`inline-block ${dimension} animate-spin rounded-full border-2 border-nexus-primary/20 border-t-nexus-primary`}
      role="status"
      aria-label="Carregando"
    />
  );
}
