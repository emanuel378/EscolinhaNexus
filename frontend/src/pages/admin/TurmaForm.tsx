import { FormEvent, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAtualizarTurma, useCriarTurma, useTurma } from "../../hooks/useTurmas";

export function TurmaFormPage() {
  const { id } = useParams<{ id: string }>();
  const modoEdicao = !!id;
  const navigate = useNavigate();

  const { data: turmaExistente } = useTurma(id ?? "");
  const criarTurma = useCriarTurma();
  const atualizarTurma = useAtualizarTurma(id ?? "");

  const [nome, setNome] = useState("");
  const [horarios, setHorarios] = useState("");
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (turmaExistente) {
      setNome(turmaExistente.nome);
      setHorarios(turmaExistente.horarios);
    }
  }, [turmaExistente]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErro(null);

    try {
      if (modoEdicao) {
        await atualizarTurma.mutateAsync({ nome, horarios });
      } else {
        await criarTurma.mutateAsync({ nome, horarios });
      }
      navigate("/admin/turmas");
    } catch {
      setErro("Não foi possível salvar a turma.");
    }
  }

  const enviando = criarTurma.isPending || atualizarTurma.isPending;

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-6 text-lg font-semibold text-slate-900">
        {modoEdicao ? "Editar turma" : "Nova turma"}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Nome</label>
          <input
            required
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            placeholder="Ex: Sub-15 Manhã"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Horários</label>
          <input
            required
            value={horarios}
            onChange={(e) => setHorarios(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            placeholder="Ex: Ter e Qui, 19h–21h"
          />
        </div>

        {erro && <p className="text-sm text-status-vermelho">{erro}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={() => navigate("/admin/turmas")}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm hover:bg-slate-100"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={enviando}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
          >
            {enviando ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </form>
    </div>
  );
}
