import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useFichaDeChamada, useMarcarFrequencias } from "../../hooks/useFrequencia";
import { useTreino } from "../../hooks/useTreinos";
import { Spinner } from "../../components/Spinner";
import { StatusFrequencia } from "../../types";

const OPCOES: { valor: StatusFrequencia; rotulo: string }[] = [
  { valor: "presente", rotulo: "Presente" },
  { valor: "falta", rotulo: "Falta" },
  { valor: "falta_justificada", rotulo: "Falta justificada" },
];

export function ChamadaPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: treino } = useTreino(id ?? "");
  const { data: ficha, isLoading } = useFichaDeChamada(id ?? "");
  const marcarFrequencias = useMarcarFrequencias(id ?? "");

  const [statusPorAluno, setStatusPorAluno] = useState<Record<string, StatusFrequencia>>({});
  const [mensagem, setMensagem] = useState<string | null>(null);

  useEffect(() => {
    if (ficha) {
      const inicial: Record<string, StatusFrequencia> = {};
      for (const item of ficha) {
        inicial[item.alunoId] = item.status ?? "presente";
      }
      setStatusPorAluno(inicial);
    }
  }, [ficha]);

  async function handleSalvar() {
    setMensagem(null);
    const registros = Object.entries(statusPorAluno).map(([alunoId, status]) => ({
      alunoId,
      status,
    }));

    try {
      await marcarFrequencias.mutateAsync(registros);
      setMensagem("Chamada salva com sucesso.");
    } catch {
      setMensagem("Não foi possível salvar a chamada.");
    }
  }

  return (
    <div className="mx-auto max-w-lg">
      <div className="mb-6">
        <Link
          to="/admin/treinos"
          className="text-sm text-slate-400 hover:text-nexus-highlight hover:underline"
        >
          ← Voltar para treinos
        </Link>
        <h1 className="mt-2 font-display text-2xl font-bold uppercase tracking-wide text-white">
          Chamada — {treino?.turma?.nome ?? "..."}
        </h1>
        {treino && (
          <p className="text-sm text-slate-400">
            {new Date(treino.data).toLocaleDateString("pt-BR")} · {treino.horaInicio}–
            {treino.horaFim} · {treino.local}
          </p>
        )}
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <Spinner /> Carregando ficha de chamada...
        </div>
      )}
      {ficha && ficha.length === 0 && (
        <p className="text-sm text-slate-400">Nenhum aluno ativo nesta turma.</p>
      )}

      {ficha && ficha.length > 0 && (
        <div className="space-y-2 rounded-xl border border-white/10 bg-nexus-surface p-4">
          {ficha.map((item) => (
            <div
              key={item.alunoId}
              className="flex flex-col gap-2 border-b border-white/5 py-3 last:border-0 sm:flex-row sm:items-center sm:justify-between"
            >
              <span className="text-sm font-medium text-white">{item.nome}</span>
              <div className="flex gap-1">
                {OPCOES.map((opcao) => (
                  <button
                    key={opcao.valor}
                    type="button"
                    onClick={() =>
                      setStatusPorAluno((prev) => ({ ...prev, [item.alunoId]: opcao.valor }))
                    }
                    className={`rounded-lg border px-2.5 py-1 text-xs transition ${
                      statusPorAluno[item.alunoId] === opcao.valor
                        ? "border-nexus-primary bg-nexus-primary text-nexus-bg font-semibold"
                        : "border-white/10 text-slate-400 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {opcao.rotulo}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {mensagem && <p className="mt-3 text-sm text-nexus-highlight">{mensagem}</p>}

      {ficha && ficha.length > 0 && (
        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={() => navigate("/admin/treinos")}
            className="rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-300 transition hover:bg-white/10 hover:text-white"
          >
            Voltar
          </button>
          <button
            onClick={handleSalvar}
            disabled={marcarFrequencias.isPending}
            className="rounded-lg bg-nexus-primary px-4 py-2 text-sm font-semibold text-nexus-bg shadow-nexus-glow transition hover:bg-nexus-highlight disabled:opacity-60"
          >
            {marcarFrequencias.isPending ? "Salvando..." : "Salvar chamada"}
          </button>
        </div>
      )}
    </div>
  );
}
