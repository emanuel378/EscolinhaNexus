import { useState } from "react";
import { useMeuCalendario } from "../../hooks/useAlunos";

function mesAtual() {
  const agora = new Date();
  return `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, "0")}`;
}

const ROTULO_STATUS: Record<string, string> = {
  presente: "✅ Presente",
  falta: "❌ Falta",
  falta_justificada: "⚠️ Falta justificada",
};

const COR_STATUS: Record<string, string> = {
  presente: "text-status-verde",
  falta: "text-status-vermelho",
  falta_justificada: "text-status-amarelo",
};

export function AlunoCalendarioPage() {
  const [mes, setMes] = useState(mesAtual());
  const { data, isLoading } = useMeuCalendario(mes);

  const presencas = data?.dias.filter((d) => d.status === "presente").length ?? 0;
  const registrados = data?.dias.filter((d) => d.status !== null).length ?? 0;
  const percentual = registrados === 0 ? 0 : Math.round((presencas / registrados) * 1000) / 10;

  return (
    <div className="mx-auto max-w-lg">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-slate-900">📅 Calendário</h1>
        <input
          type="month"
          value={mes}
          onChange={(e) => setMes(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
        />
      </div>

      {registrados > 0 && (
        <p className="mb-4 text-sm text-slate-500">
          Frequência no mês: <span className="font-semibold text-slate-900">{percentual}%</span>
        </p>
      )}

      {isLoading && <p className="text-sm text-slate-500">Carregando...</p>}

      {data && data.dias.length === 0 && (
        <p className="text-sm text-slate-500">Nenhum treino cadastrado para este mês.</p>
      )}

      {data && data.dias.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          {data.dias.map((dia) => (
            <div
              key={dia.treinoId}
              className="flex items-center justify-between border-b border-slate-100 px-4 py-3 text-sm last:border-0"
            >
              <div>
                <p className="font-medium text-slate-900">
                  {new Date(dia.data + "T00:00:00").toLocaleDateString("pt-BR")} · {dia.horaInicio}
                </p>
                <p className="text-xs text-slate-500">
                  {dia.tipo} · {dia.local}
                </p>
              </div>
              <span className={dia.status ? COR_STATUS[dia.status] : "text-slate-400"}>
                {dia.status ? ROTULO_STATUS[dia.status] : "Aguardando"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
