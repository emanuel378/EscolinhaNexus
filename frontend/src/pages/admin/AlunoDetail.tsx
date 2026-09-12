import { FormEvent, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAluno } from "../../hooks/useAlunos";
import { useHistoricoFrequenciaAluno } from "../../hooks/useFrequencia";
import {
  useAtualizarMensalidade,
  useCriarMensalidade,
  useMensalidadesDoAluno,
  useRemoverMensalidade,
} from "../../hooks/useMensalidades";
import { StatusBadge } from "../../components/StatusBadge";
import { StatusMensalidade } from "../../types";

function formatarMoeda(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function SecaoFrequencia({ alunoId }: { alunoId: string }) {
  const { data: historico, isLoading } = useHistoricoFrequenciaAluno(alunoId);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6">
      <h2 className="mb-3 text-sm font-semibold text-slate-900">Frequência</h2>
      {isLoading && <p className="text-sm text-slate-500">Carregando...</p>}
      {historico && (
        <>
          <div className="mb-4 flex items-center gap-4">
            <span className="text-3xl font-semibold text-slate-900">
              {historico.percentual}%
            </span>
            <span className="text-xs text-slate-500">
              {historico.presencas} presenças · {historico.faltas} faltas ·{" "}
              {historico.faltasJustificadas} justificadas
              <br />
              de {historico.totalRegistros} treinos registrados
            </span>
          </div>
          {historico.historico.length > 0 && (
            <div className="max-h-48 space-y-1 overflow-y-auto text-xs">
              {historico.historico.slice(0, 10).map((item) => (
                <div key={item.id} className="flex justify-between border-t border-slate-100 py-1.5">
                  <span className="text-slate-600">
                    {item.treino ? new Date(item.treino.data).toLocaleDateString("pt-BR") : "—"}
                    {" · "}
                    {item.treino?.turma ?? "—"}
                  </span>
                  <span
                    className={
                      item.status === "presente"
                        ? "text-status-verde"
                        : item.status === "falta_justificada"
                          ? "text-status-amarelo"
                          : "text-status-vermelho"
                    }
                  >
                    {item.status === "presente"
                      ? "Presente"
                      : item.status === "falta_justificada"
                        ? "Falta justificada"
                        : "Falta"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function SecaoMensalidades({ alunoId }: { alunoId: string }) {
  const { data: mensalidades, isLoading } = useMensalidadesDoAluno(alunoId);
  const criarMensalidade = useCriarMensalidade(alunoId);
  const atualizarMensalidade = useAtualizarMensalidade(alunoId);
  const removerMensalidade = useRemoverMensalidade(alunoId);

  const [mostrarForm, setMostrarForm] = useState(false);
  const [mesReferencia, setMesReferencia] = useState("");
  const [valor, setValor] = useState("");
  const [vencimento, setVencimento] = useState("");
  const [erro, setErro] = useState<string | null>(null);

  async function handleAdicionar(e: FormEvent) {
    e.preventDefault();
    setErro(null);
    try {
      await criarMensalidade.mutateAsync({
        mesReferencia,
        valor: Number(valor),
        vencimento,
      });
      setMesReferencia("");
      setValor("");
      setVencimento("");
      setMostrarForm(false);
    } catch {
      setErro("Não foi possível lançar a mensalidade (verifique se o mês já não foi lançado).");
    }
  }

  async function handleMudarStatus(id: string, status: StatusMensalidade) {
    await atualizarMensalidade.mutateAsync({
      id,
      input: {
        status,
        dataPagamento: status === "pago" ? new Date().toISOString().substring(0, 10) : null,
      },
    });
  }

  async function handleRemover(id: string) {
    if (!confirm("Remover esta mensalidade?")) return;
    await removerMensalidade.mutateAsync(id);
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-900">Mensalidades</h2>
        <button
          onClick={() => setMostrarForm((v) => !v)}
          className="rounded-lg border border-slate-300 px-3 py-1 text-xs hover:bg-slate-100"
        >
          {mostrarForm ? "Cancelar" : "+ Lançar mês"}
        </button>
      </div>

      {mostrarForm && (
        <form onSubmit={handleAdicionar} className="mb-4 space-y-2 rounded-lg bg-slate-50 p-3">
          <div className="grid grid-cols-3 gap-2">
            <input
              required
              placeholder="YYYY-MM"
              value={mesReferencia}
              onChange={(e) => setMesReferencia(e.target.value)}
              className="rounded-lg border border-slate-300 px-2 py-1.5 text-xs"
            />
            <input
              required
              type="number"
              step="0.01"
              placeholder="Valor"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              className="rounded-lg border border-slate-300 px-2 py-1.5 text-xs"
            />
            <input
              required
              type="date"
              value={vencimento}
              onChange={(e) => setVencimento(e.target.value)}
              className="rounded-lg border border-slate-300 px-2 py-1.5 text-xs"
            />
          </div>
          {erro && <p className="text-xs text-status-vermelho">{erro}</p>}
          <button
            type="submit"
            disabled={criarMensalidade.isPending}
            className="w-full rounded-lg bg-slate-900 py-1.5 text-xs font-medium text-white hover:bg-slate-800 disabled:opacity-60"
          >
            {criarMensalidade.isPending ? "Salvando..." : "Lançar"}
          </button>
        </form>
      )}

      {isLoading && <p className="text-sm text-slate-500">Carregando...</p>}
      {mensalidades && mensalidades.length === 0 && (
        <p className="text-sm text-slate-500">Nenhuma mensalidade lançada.</p>
      )}

      {mensalidades && mensalidades.length > 0 && (
        <div className="space-y-2">
          {mensalidades.map((m) => (
            <div
              key={m.id}
              className="flex items-center justify-between border-t border-slate-100 py-2 text-sm"
            >
              <div>
                <p className="font-medium text-slate-900">{m.mesReferencia}</p>
                <p className="text-xs text-slate-500">
                  {formatarMoeda(m.valor)} · vence em{" "}
                  {new Date(m.vencimento).toLocaleDateString("pt-BR")}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={m.status} />
                <select
                  value={m.status}
                  onChange={(e) => handleMudarStatus(m.id, e.target.value as StatusMensalidade)}
                  className="rounded-lg border border-slate-300 px-1.5 py-1 text-xs"
                >
                  <option value="pendente">Pendente</option>
                  <option value="pago">Pago</option>
                  <option value="atrasado">Atrasado</option>
                </select>
                <button
                  onClick={() => handleRemover(m.id)}
                  className="text-xs text-status-vermelho hover:underline"
                >
                  Remover
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function AlunoDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: aluno, isLoading, isError } = useAluno(id ?? "");

  if (isLoading) return <p className="text-sm text-slate-500">Carregando...</p>;
  if (isError || !aluno) return <p className="text-sm text-status-vermelho">Aluno não encontrado.</p>;

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-slate-900">{aluno.usuario.nome}</h1>
        <Link
          to={`/admin/alunos/${aluno.id}/editar`}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm hover:bg-slate-100"
        >
          Editar
        </Link>
      </div>

      <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 text-sm">
        <div className="flex justify-between">
          <span className="text-slate-500">Status</span>
          <StatusBadge status={aluno.status} />
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Email</span>
          <span className="text-slate-900">{aluno.usuario.email}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Data de nascimento</span>
          <span className="text-slate-900">
            {new Date(aluno.dataNascimento).toLocaleDateString("pt-BR")}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Telefone</span>
          <span className="text-slate-900">{aluno.telefone ?? "—"}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Turma</span>
          <span className="text-slate-900">{aluno.turma?.nome ?? "—"}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Entrada</span>
          <span className="text-slate-900">
            {new Date(aluno.dataEntrada).toLocaleDateString("pt-BR")}
          </span>
        </div>
      </div>

      <SecaoFrequencia alunoId={aluno.id} />
      <SecaoMensalidades alunoId={aluno.id} />

      <Link to="/admin/alunos" className="inline-block text-sm text-slate-500 hover:underline">
        ← Voltar para a lista
      </Link>
    </div>
  );
}
