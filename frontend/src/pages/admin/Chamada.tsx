import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useFichaDeChamada, useMarcarFrequencias } from "../../hooks/useFrequencia";
import { useTreino } from "../../hooks/useTreinos";
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
        <Link to="/admin/treinos" className="text-sm text-slate-500 hover:underline">
          ← Voltar para treinos
        </Link>
        <h1 className="mt-2 text-lg font-semibold text-slate-900">
          Chamada — {treino?.turma?.nome ?? "..."}
        </h1>
        {treino && (
          <p className="text-sm text-slate-500">
            {new Date(treino.data).toLocaleDateString("pt-BR")} · {treino.horaInicio}–
            {treino.horaFim} · {treino.local}
          </p>
        )}
      </div>

      {isLoading && <p className="text-sm text-slate-500">Carregando ficha de chamada...</p>}
      {ficha && ficha.length === 0 && (
        <p className="text-sm text-slate-500">Nenhum aluno ativo nesta turma.</p>
      )}

      {ficha && ficha.length > 0 && (
        <div className="space-y-2 rounded-xl border border-slate-200 bg-white p-4">
          {ficha.map((item) => (
            <div
              key={item.alunoId}
              className="flex flex-col gap-2 border-b border-slate-100 py-3 last:border-0 sm:flex-row sm:items-center sm:justify-between"
            >
              <span className="text-sm font-medium text-slate-900">{item.nome}</span>
              <div className="flex gap-1">
                {OPCOES.map((opcao) => (
                  <button
                    key={opcao.valor}
                    type="button"
                    onClick={() =>
                      setStatusPorAluno((prev) => ({ ...prev, [item.alunoId]: opcao.valor }))
                    }
                    className={`rounded-lg border px-2.5 py-1 text-xs ${
                      statusPorAluno[item.alunoId] === opcao.valor
                        ? "border-slate-900 bg-slate-900 text-white"
                        : "border-slate-300 text-slate-600 hover:bg-slate-100"
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

      {mensagem && <p className="mt-3 text-sm text-slate-600">{mensagem}</p>}

      {ficha && ficha.length > 0 && (
        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={() => navigate("/admin/treinos")}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm hover:bg-slate-100"
          >
            Voltar
          </button>
          <button
            onClick={handleSalvar}
            disabled={marcarFrequencias.isPending}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
          >
            {marcarFrequencias.isPending ? "Salvando..." : "Salvar chamada"}
          </button>
        </div>
      )}
    </div>
  );
}
