import { useState } from "react";
import { Relatorio } from "../types";
import { baixarRelatorioPdf } from "../utils/relatorioPdf";
import { Icon } from "./Icon";

export function BaixarRelatorioBotao({
  relatorio,
  atleta,
  className = "",
}: {
  relatorio: Relatorio;
  atleta: { nome: string; turma: string | null };
  className?: string;
}) {
  const [gerando, setGerando] = useState(false);
  const [erro, setErro] = useState(false);

  async function handleBaixar() {
    setGerando(true);
    setErro(false);
    try {
      await baixarRelatorioPdf(relatorio, atleta);
    } catch {
      setErro(true);
    } finally {
      setGerando(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleBaixar}
      disabled={gerando}
      title="Baixar a folha do relatório em PDF"
      className={`inline-flex items-center justify-center gap-1.5 rounded-lg border border-nexus-primary/40 bg-nexus-primary/10 px-3 py-2 text-xs font-semibold text-nexus-highlight transition hover:bg-nexus-primary/20 disabled:opacity-60 ${className}`}
    >
      <Icon
        name={gerando ? "progress_activity" : erro ? "error" : "download"}
        className={`text-[18px] ${gerando ? "animate-spin" : ""}`}
      />
      {gerando ? "Gerando..." : erro ? "Tentar de novo" : "Baixar PDF"}
    </button>
  );
}
