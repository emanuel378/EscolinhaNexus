const MESES_CURTOS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

/** Mês corrente no formato YYYY-MM (mesmo formato de `mesReferencia` da API). */
export function mesAtual() {
  const agora = new Date();
  return `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, "0")}`;
}

/** "2024-11" → "Nov / 2024" */
export function formatarMesCurto(mesReferencia: string) {
  const [ano, mes] = mesReferencia.split("-").map(Number);
  return `${MESES_CURTOS[mes - 1]} / ${ano}`;
}

/** Os últimos `quantidade` meses (YYYY-MM), do mais recente para o mais antigo. */
export function ultimosMeses(quantidade: number) {
  const agora = new Date();
  return Array.from({ length: quantidade }, (_, i) => {
    const d = new Date(agora.getFullYear(), agora.getMonth() - i, 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });
}

/** Rótulo relativo de um dia (YYYY-MM-DD): "Hoje", "Amanhã" ou "Sex, 15/11". */
export function rotuloDia(data: string) {
  const alvo = new Date(data + "T00:00:00");
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const diffDias = Math.round((alvo.getTime() - hoje.getTime()) / 86_400_000);
  if (diffDias === 0) return "Hoje";
  if (diffDias === 1) return "Amanhã";
  const semana = alvo.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", "");
  const dia = alvo.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
  return `${semana.charAt(0).toUpperCase()}${semana.slice(1)}, ${dia}`;
}

/** "2024-11-10" → "10/11/2024" */
export function formatarData(data: string) {
  return new Date(data + "T00:00:00").toLocaleDateString("pt-BR");
}
