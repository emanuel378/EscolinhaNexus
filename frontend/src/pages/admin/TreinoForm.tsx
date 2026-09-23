import { FormEvent, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAtualizarTreino, useCriarTreino, useTreino } from "../../hooks/useTreinos";
import { useTurmas } from "../../hooks/useTurmas";

const inputClass =
  "w-full rounded-lg border border-white/10 bg-nexus-bg/60 px-3 py-2 text-sm text-white placeholder-slate-500 outline-none transition focus:border-nexus-primary focus:ring-2 focus:ring-nexus-primary/40";
const labelClass = "mb-1 block text-sm font-medium text-slate-300";

export function TreinoFormPage() {
  const { id } = useParams<{ id: string }>();
  const modoEdicao = !!id;
  const navigate = useNavigate();

  const { data: turmas } = useTurmas();
  const { data: treinoExistente } = useTreino(id ?? "");
  const criarTreino = useCriarTreino();
  const atualizarTreino = useAtualizarTreino(id ?? "");

  const [turmaId, setTurmaId] = useState("");
  const [data, setData] = useState("");
  const [horaInicio, setHoraInicio] = useState("");
  const [horaFim, setHoraFim] = useState("");
  const [local, setLocal] = useState("");
  const [tipo, setTipo] = useState("Treino");
  const [observacao, setObservacao] = useState("");
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (treinoExistente) {
      setTurmaId(treinoExistente.turmaId);
      setData(treinoExistente.data.substring(0, 10));
      setHoraInicio(treinoExistente.horaInicio);
      setHoraFim(treinoExistente.horaFim);
      setLocal(treinoExistente.local);
      setTipo(treinoExistente.tipo);
      setObservacao(treinoExistente.observacao ?? "");
    }
  }, [treinoExistente]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErro(null);

    const dados = {
      turmaId,
      data,
      horaInicio,
      horaFim,
      local,
      tipo,
      observacao: observacao || undefined,
    };

    try {
      if (modoEdicao) {
        await atualizarTreino.mutateAsync(dados);
      } else {
        await criarTreino.mutateAsync(dados);
      }
      navigate("/admin/treinos");
    } catch {
      setErro("Não foi possível salvar o treino.");
    }
  }

  const enviando = criarTreino.isPending || atualizarTreino.isPending;

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-6 font-display text-2xl font-bold uppercase tracking-wide text-white">
        {modoEdicao ? "Editar treino" : "Novo treino"}
      </h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-xl border border-white/10 bg-nexus-surface p-6"
      >
        <div>
          <label className={labelClass}>Turma</label>
          <select
            required
            value={turmaId}
            onChange={(e) => setTurmaId(e.target.value)}
            className={inputClass}
          >
            <option value="" disabled>
              Selecione uma turma
            </option>
            {turmas?.map((t) => (
              <option key={t.id} value={t.id}>
                {t.nome}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>Data</label>
          <input
            type="date"
            required
            value={data}
            onChange={(e) => setData(e.target.value)}
            className={inputClass}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Início</label>
            <input
              type="time"
              required
              value={horaInicio}
              onChange={(e) => setHoraInicio(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Fim</label>
            <input
              type="time"
              required
              value={horaFim}
              onChange={(e) => setHoraFim(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>Local</label>
          <input
            required
            value={local}
            onChange={(e) => setLocal(e.target.value)}
            className={inputClass}
            placeholder="Ex: Quadra 1"
          />
        </div>

        <div>
          <label className={labelClass}>Tipo</label>
          <input
            required
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            className={inputClass}
            placeholder="Ex: Treino técnico, Amistoso..."
          />
        </div>

        <div>
          <label className={labelClass}>Observação (opcional)</label>
          <textarea
            value={observacao}
            onChange={(e) => setObservacao(e.target.value)}
            className={inputClass}
            rows={3}
          />
        </div>

        {erro && <p className="text-sm text-red-400">{erro}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={() => navigate("/admin/treinos")}
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
