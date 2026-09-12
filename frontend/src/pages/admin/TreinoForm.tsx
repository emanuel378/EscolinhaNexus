import { FormEvent, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAtualizarTreino, useCriarTreino, useTreino } from "../../hooks/useTreinos";
import { useTurmas } from "../../hooks/useTurmas";

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
      <h1 className="mb-6 text-lg font-semibold text-slate-900">
        {modoEdicao ? "Editar treino" : "Novo treino"}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Turma</label>
          <select
            required
            value={turmaId}
            onChange={(e) => setTurmaId(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
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
          <label className="mb-1 block text-sm font-medium text-slate-700">Data</label>
          <input
            type="date"
            required
            value={data}
            onChange={(e) => setData(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Início</label>
            <input
              type="time"
              required
              value={horaInicio}
              onChange={(e) => setHoraInicio(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Fim</label>
            <input
              type="time"
              required
              value={horaFim}
              onChange={(e) => setHoraFim(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Local</label>
          <input
            required
            value={local}
            onChange={(e) => setLocal(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            placeholder="Ex: Quadra 1"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Tipo</label>
          <input
            required
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            placeholder="Ex: Treino técnico, Amistoso..."
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Observação (opcional)
          </label>
          <textarea
            value={observacao}
            onChange={(e) => setObservacao(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            rows={3}
          />
        </div>

        {erro && <p className="text-sm text-status-vermelho">{erro}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={() => navigate("/admin/treinos")}
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
