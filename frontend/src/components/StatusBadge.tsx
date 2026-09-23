interface StatusBadgeProps {
  status: "ativo" | "inativo" | "pago" | "pendente" | "atrasado";
}

const estilos: Record<StatusBadgeProps["status"], string> = {
  ativo: "border-status-verde/30 bg-status-verde/10 text-status-verde",
  pago: "border-status-verde/30 bg-status-verde/10 text-status-verde",
  pendente: "border-status-amarelo/30 bg-status-amarelo/10 text-status-amarelo",
  inativo: "border-status-vermelho/30 bg-status-vermelho/10 text-status-vermelho",
  atrasado: "border-status-vermelho/30 bg-status-vermelho/10 text-status-vermelho",
};

const rotulos: Record<StatusBadgeProps["status"], string> = {
  ativo: "Ativo",
  inativo: "Inativo",
  pago: "Pago",
  pendente: "Pendente",
  atrasado: "Atrasado",
};

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${estilos[status]}`}
    >
      {rotulos[status]}
    </span>
  );
}
