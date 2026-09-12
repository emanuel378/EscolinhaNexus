interface StatusBadgeProps {
  status: "ativo" | "inativo" | "pago" | "pendente" | "atrasado";
}

const estilos: Record<StatusBadgeProps["status"], string> = {
  ativo: "bg-green-100 text-status-verde",
  pago: "bg-green-100 text-status-verde",
  pendente: "bg-yellow-100 text-status-amarelo",
  inativo: "bg-red-100 text-status-vermelho",
  atrasado: "bg-red-100 text-status-vermelho",
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
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${estilos[status]}`}
    >
      {rotulos[status]}
    </span>
  );
}
