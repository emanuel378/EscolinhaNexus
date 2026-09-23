import { FormEvent, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAtualizarTurma, useCriarTurma, useTurma } from "../../hooks/useTurmas";

const inputClass =
  "w-full rounded-lg border border-white/10 bg-nexus-bg/60 px-3 py-2 text-sm text-white placeholder-slate-500 outline-none transition focus:border-nexus-primary focus:ring-2 focus:ring-nexus-primary/40";
const labelClass = "mb-1 block text-sm font-medium text-slate-300";

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
      <h1 className="mb-6 font-display text-2xl font-bold uppercase tracking-wide text-white">
        {modoEdicao ? "Editar turma" : "Nova turma"}
      </h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-xl border border-white/10 bg-nexus-surface p-6"
      >
        <div>
          <label className={labelClass}>Nome</label>
          <input
            required
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className={inputClass}
            placeholder="Ex: Sub-15 Manhã"
          />
        </div>

        <div>
          <label className={labelClass}>Horários</label>
          <input
            required
            value={horarios}
            onChange={(e) => setHorarios(e.target.value)}
            className={inputClass}
            placeholder="Ex: Ter e Qui, 19h–21h"
          />
        </div>

        {erro && <p className="text-sm text-red-400">{erro}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={() => navigate("/admin/turmas")}
            className="rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-300 transition hover:bg-white/10 hover:text-white"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={enviando}
            className="rounded-lg bg-nexus-primary px-4 py-2 text-sm font-semibold text-nexus-bg shadow-nexus-glow transition hover:bg-nexus-highlight disabled:opacity-60"
          >
            {enviando ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </form>
    </div>
  );
}
