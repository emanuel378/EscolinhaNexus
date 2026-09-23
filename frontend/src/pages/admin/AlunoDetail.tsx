import { FormEvent, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { useAluno } from "../../hooks/useAlunos";
import { useHistoricoFrequenciaAluno } from "../../hooks/useFrequencia";
import {
  useAtualizarMensalidade,
  useCriarMensalidade,
  useMensalidadesDoAluno,
  useRemoverMensalidade,
} from "../../hooks/useMensalidades";
import { StatusBadge } from "../../components/StatusBadge";
import { Spinner } from "../../components/Spinner";
import { SkillBar } from "../../components/SkillBar";
import { RelatorioForm } from "../../components/RelatorioForm";
import { useEnviarRelatorio, useRelatoriosDoAluno, useRemoverRelatorio } from "../../hooks/useRelatorios";
import { StatusMensalidade } from "../../types";

const inputClass =
  "rounded-lg border border-white/10 bg-nexus-bg/60 px-2 py-1.5 text-xs text-white placeholder-slate-500 outline-none transition focus:border-nexus-primary focus:ring-2 focus:ring-nexus-primary/40";

function formatarMoeda(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function SecaoFrequencia({ alunoId }: { alunoId: string }) {
  const { data: historico, isLoading } = useHistoricoFrequenciaAluno(alunoId);

  return (
    <div className="rounded-xl border border-white/10 bg-nexus-surface p-6">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-300">
        Frequência
      </h2>
      {isLoading && (
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <Spinner /> Carregando...
        </div>
      )}
      {historico && (
        <>
          <div className="mb-4 flex items-center gap-4">
            <span className="font-display text-3xl font-bold text-nexus-primary">
              {historico.percentual}%
            </span>
            <span className="text-xs text-slate-400">
              {historico.presencas} presenças · {historico.faltas} faltas ·{" "}
              {historico.faltasJustificadas} justificadas
              <br />
              de {historico.totalRegistros} treinos registrados
            </span>
          </div>
          {historico.historico.length > 0 && (
            <div className="max-h-48 space-y-1 overflow-y-auto text-xs">
              {historico.historico.slice(0, 10).map((item) => (
                <div key={item.id} className="flex justify-between border-t border-white/5 py-1.5">
                  <span className="text-slate-400">
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
    <div className="rounded-xl border border-white/10 bg-nexus-surface p-6">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300">
          Mensalidades
        </h2>
        <button
          onClick={() => setMostrarForm((v) => !v)}
          className="rounded-lg border border-white/10 px-3 py-1 text-xs text-slate-300 transition hover:bg-white/10 hover:text-white"
        >
          {mostrarForm ? "Cancelar" : "+ Lançar mês"}
        </button>
      </div>

      {mostrarForm && (
        <form onSubmit={handleAdicionar} className="mb-4 space-y-2 rounded-lg bg-white/5 p-3">
          <div className="grid grid-cols-3 gap-2">
            <input
              required
              placeholder="YYYY-MM"
              value={mesReferencia}
              onChange={(e) => setMesReferencia(e.target.value)}
              className={inputClass}
            />
            <input
              required
              type="number"
              step="0.01"
              placeholder="Valor"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              className={inputClass}
            />
            <input
              required
              type="date"
              value={vencimento}
              onChange={(e) => setVencimento(e.target.value)}
              className={inputClass}
            />
          </div>
          {erro && <p className="text-xs text-red-400">{erro}</p>}
          <button
            type="submit"
            disabled={criarMensalidade.isPending}
            className="w-full rounded-lg bg-nexus-primary py-1.5 text-xs font-semibold text-nexus-bg shadow-nexus-glow transition hover:bg-nexus-highlight disabled:opacity-60"
          >
            {criarMensalidade.isPending ? "Salvando..." : "Lançar"}
          </button>
        </form>
      )}

      {isLoading && (
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <Spinner /> Carregando...
        </div>
      )}
      {mensalidades && mensalidades.length === 0 && (
        <p className="text-sm text-slate-400">Nenhuma mensalidade lançada.</p>
      )}

      {mensalidades && mensalidades.length > 0 && (
        <div className="space-y-2">
          {mensalidades.map((m) => (
            <div
              key={m.id}
              className="flex items-center justify-between border-t border-white/5 py-2 text-sm"
            >
              <div>
                <p className="font-medium text-white">{m.mesReferencia}</p>
                <p className="text-xs text-slate-400">
                  {formatarMoeda(m.valor)} · vence em{" "}
                  {new Date(m.vencimento).toLocaleDateString("pt-BR")}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={m.status} />
                <select
                  value={m.status}
                  onChange={(e) => handleMudarStatus(m.id, e.target.value as StatusMensalidade)}
                  className="rounded-lg border border-white/10 bg-nexus-bg/60 px-1.5 py-1 text-xs text-white outline-none transition focus:border-nexus-primary focus:ring-2 focus:ring-nexus-primary/40"
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

function formatarMesReferencia(mesReferencia: string) {
  const [ano, mes] = mesReferencia.split("-");
  const data = new Date(Number(ano), Number(mes) - 1, 1);
  const texto = data.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

function SecaoRelatorios({ alunoId, abrirFormInicial }: { alunoId: string; abrirFormInicial: boolean }) {
  const { data: relatorios, isLoading } = useRelatoriosDoAluno(alunoId);
  const enviarRelatorio = useEnviarRelatorio(alunoId);
  const removerRelatorio = useRemoverRelatorio(alunoId);

  const [mostrarForm, setMostrarForm] = useState(abrirFormInicial);
  const [expandidoId, setExpandidoId] = useState<string | null>(null);

  async function handleRemover(id: string) {
    if (!confirm("Remover este relatório de desempenho?")) return;
    await removerRelatorio.mutateAsync(id);
  }

  return (
    <div className="rounded-xl border border-nexus-primary/30 bg-nexus-surface p-6 shadow-nexus-glow">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-white">
          <svg viewBox="0 0 20 20" className="h-4 w-4 fill-nexus-primary">
            <path d="M10 1.5l2.47 5.4 5.93.62-4.45 4.02 1.24 5.86L10 14.77l-5.19 2.63 1.24-5.86L1.6 7.52l5.93-.62L10 1.5z" />
          </svg>
          Relatório de desempenho
        </h2>
        <button
          onClick={() => setMostrarForm((v) => !v)}
          className="rounded-lg bg-nexus-primary px-3 py-1 text-xs font-semibold text-nexus-bg transition hover:bg-nexus-highlight"
        >
          {mostrarForm ? "Cancelar" : "+ Enviar relatório"}
        </button>
      </div>

      {mostrarForm && (
        <RelatorioForm
          enviando={enviarRelatorio.isPending}
          onCancelar={() => setMostrarForm(false)}
          onEnviar={async (input) => {
            await enviarRelatorio.mutateAsync(input);
            setMostrarForm(false);
          }}
        />
      )}

      {isLoading && (
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <Spinner /> Carregando...
        </div>
      )}
      {relatorios && relatorios.length === 0 && (
        <p className="text-sm text-slate-400">Nenhum relatório enviado ainda.</p>
      )}

      {relatorios && relatorios.length > 0 && (
        <div className="space-y-2">
          {relatorios.map((relatorio) => {
            const expandido = expandidoId === relatorio.id;
            return (
              <div key={relatorio.id} className="border-t border-white/5 pt-2 first:border-0 first:pt-0">
                <button
                  onClick={() => setExpandidoId(expandido ? null : relatorio.id)}
                  className="flex w-full items-center justify-between gap-3 py-1 text-left"
                >
                  <span className="text-sm font-medium text-white">
                    {formatarMesReferencia(relatorio.mesReferencia)}
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="rounded-full border border-nexus-primary/30 bg-nexus-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-nexus-primary">
                      Geral {relatorio.medias.geral.toFixed(1)}
                    </span>
                    <svg
                      viewBox="0 0 20 20"
                      className={`h-4 w-4 fill-slate-400 transition-transform ${expandido ? "rotate-180" : ""}`}
                    >
                      <path d="M5.5 7.5l4.5 4.5 4.5-4.5" stroke="currentColor" strokeWidth="1.5" fill="none" />
                    </svg>
                  </span>
                </button>

                {expandido && (
                  <div className="mt-3 space-y-4 pb-2">
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                      <SkillBar label="Técnico" value={relatorio.medias.tecnico} />
                      <SkillBar label="Físico" value={relatorio.medias.fisico} />
                      <SkillBar label="Tático" value={relatorio.medias.tatico} />
                      <SkillBar label="Mental" value={relatorio.medias.mental} />
                    </div>
                    <div className="space-y-2 text-xs">
                      <p>
                        <span className="font-semibold text-nexus-highlight">Pontos fortes: </span>
                        <span className="text-slate-300">{relatorio.pontosFortes}</span>
                      </p>
                      <p>
                        <span className="font-semibold text-nexus-highlight">A melhorar: </span>
                        <span className="text-slate-300">{relatorio.pontosMelhorar}</span>
                      </p>
                      <p>
                        <span className="font-semibold text-nexus-highlight">Objetivo: </span>
                        <span className="text-slate-300">{relatorio.objetivoProximoMes}</span>
                      </p>
                    </div>
                    <button
                      onClick={() => handleRemover(relatorio.id)}
                      className="text-xs text-status-vermelho hover:underline"
                    >
                      Remover relatório
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function AlunoDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const abrirRelatorio = searchParams.get("relatorio") === "1";
  const { data: aluno, isLoading, isError } = useAluno(id ?? "");

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-slate-400">
        <Spinner /> Carregando...
      </div>
    );
  }
  if (isError || !aluno) return <p className="text-sm text-red-400">Aluno não encontrado.</p>;

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold uppercase tracking-wide text-white">
          {aluno.usuario.nome}
        </h1>
        <Link
          to={`/admin/alunos/${aluno.id}/editar`}
          className="rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-300 transition hover:bg-white/10 hover:text-white"
        >
          Editar
        </Link>
      </div>

      <div className="space-y-4 rounded-xl border border-white/10 bg-nexus-surface p-6 text-sm">
        <div className="flex justify-between">
          <span className="text-slate-400">Status</span>
          <StatusBadge status={aluno.status} />
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Email</span>
          <span className="text-white">{aluno.usuario.email}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Data de nascimento</span>
          <span className="text-white">
            {new Date(aluno.dataNascimento).toLocaleDateString("pt-BR")}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Telefone</span>
          <span className="text-white">{aluno.telefone ?? "—"}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Turma</span>
          <span className="text-white">{aluno.turma?.nome ?? "—"}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Entrada</span>
          <span className="text-white">
            {new Date(aluno.dataEntrada).toLocaleDateString("pt-BR")}
          </span>
        </div>
      </div>

      <SecaoRelatorios alunoId={aluno.id} abrirFormInicial={abrirRelatorio} />
      <SecaoFrequencia alunoId={aluno.id} />
      <SecaoMensalidades alunoId={aluno.id} />

      <Link
        to="/admin/alunos"
        className="inline-block text-sm text-slate-400 hover:text-nexus-highlight hover:underline"
      >
        ← Voltar para a lista
      </Link>
    </div>
  );
}
