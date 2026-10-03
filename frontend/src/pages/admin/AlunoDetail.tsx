import { FormEvent, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useAlterarStatusAluno, useAluno, useRemoverAluno } from "../../hooks/useAlunos";
import { useHistoricoFrequenciaAluno } from "../../hooks/useFrequencia";
import {
  useAtualizarMensalidade,
  useCriarMensalidade,
  useMensalidadesDoAluno,
  useRemoverMensalidade,
} from "../../hooks/useMensalidades";
import {
  useLancarPontuacao,
  usePontuacoesDoAluno,
  useRemoverPontuacao,
} from "../../hooks/usePontuacoes";
import {
  useCriarRelatorio,
  useRelatoriosDoAluno,
  useRemoverRelatorio,
} from "../../hooks/useRelatorios";
import { useRanking } from "../../hooks/useRanking";
import { RelatorioNotasForm, RelatorioNotasResumo } from "../../components/RelatorioNotas";
import { FotoAlunoUpload } from "../../components/FotoAlunoUpload";
import { BaixarRelatorioBotao } from "../../components/BaixarRelatorioBotao";
import { Icon } from "../../components/Icon";
import { Esqueleto, MensagemErro, TituloSecao } from "../../components/AdminUI";
import { NotasRelatorio, StatusFrequencia, StatusMensalidade } from "../../types";
import { valoresIniciais } from "../../utils/relatorio";
import { formatarData } from "../../utils/data";

function formatarMoeda(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// Mês (YYYY-MM) em UTC, o mesmo recorte usado pelo ranking no backend.
function mesUtcAtual() {
  return new Date().toISOString().substring(0, 7);
}

function formatarMes(mes: string) {
  const [ano, m] = mes.split("-").map(Number);
  const nome = new Date(Date.UTC(ano, m - 1, 1)).toLocaleDateString("pt-BR", {
    month: "long",
    timeZone: "UTC",
  });
  return `${nome.charAt(0).toUpperCase()}${nome.slice(1)} / ${ano}`;
}

// Data enviada para o lançamento: no mês corrente usa o momento atual (conta
// também no recorte semanal do ranking); em outro mês, o dia 15 ao meio-dia
// UTC, que cai dentro do mês em qualquer fuso.
function dataDoLancamento(mes: string) {
  return mes === mesUtcAtual() ? undefined : `${mes}-15T12:00:00.000Z`;
}

function idade(dataNascimento: string) {
  const nascimento = new Date(dataNascimento.substring(0, 10) + "T00:00:00");
  const hoje = new Date();
  let anos = hoje.getFullYear() - nascimento.getFullYear();
  const aindaNaoFezAniversario =
    hoje.getMonth() < nascimento.getMonth() ||
    (hoje.getMonth() === nascimento.getMonth() && hoje.getDate() < nascimento.getDate());
  if (aindaNaoFezAniversario) anos -= 1;
  return anos;
}

const STATUS_FREQUENCIA: Record<
  StatusFrequencia,
  { sigla: string; rotulo: string; classe: string; texto: string }
> = {
  presente: {
    sigla: "P",
    rotulo: "Presente",
    classe: "border-status-verde/60 bg-status-verde/20 text-green-400",
    texto: "text-green-400",
  },
  falta: {
    sigla: "F",
    rotulo: "Falta",
    classe: "border-status-vermelho/60 bg-status-vermelho/20 text-red-400",
    texto: "text-red-400",
  },
  falta_justificada: {
    sigla: "J",
    rotulo: "Justificada",
    classe: "border-status-amarelo/60 bg-status-amarelo/20 text-yellow-400",
    texto: "text-yellow-400",
  },
};

const CHIP_MENSALIDADE: Record<StatusMensalidade, { classe: string; rotulo: string }> = {
  pago: { classe: "chip-verde", rotulo: "Em dia" },
  pendente: { classe: "chip-amarelo", rotulo: "Pendente" },
  atrasado: { classe: "chip-vermelho", rotulo: "Atrasado" },
};

// ---------------------------------------------------------------------------
// Pontuação
// ---------------------------------------------------------------------------

function SecaoPontuacao({ alunoId }: { alunoId: string }) {
  const { data, isLoading } = usePontuacoesDoAluno(alunoId);
  const lancarPontuacao = useLancarPontuacao(alunoId);
  const removerPontuacao = useRemoverPontuacao(alunoId);

  const [pontos, setPontos] = useState("");
  const [motivo, setMotivo] = useState("");
  const [mesLancamento, setMesLancamento] = useState(mesUtcAtual);
  const [mesFiltro, setMesFiltro] = useState(mesUtcAtual);
  const [erro, setErro] = useState<string | null>(null);

  const { data: ranking } = useRanking({ mesReferencia: mesFiltro || mesUtcAtual() });
  const noRanking = ranking?.ranking.find((r) => r.alunoId === alunoId);

  const mesesComPontos = data
    ? Array.from(new Set([mesUtcAtual(), ...data.historico.map((p) => p.data.substring(0, 7))]))
        .sort()
        .reverse()
    : [];
  const historicoFiltrado = data
    ? data.historico.filter((p) => !mesFiltro || p.data.substring(0, 7) === mesFiltro)
    : [];
  const totalFiltrado = historicoFiltrado.reduce((soma, p) => soma + p.pontos, 0);
  const saldo = mesFiltro ? totalFiltrado : (data?.total ?? 0);

  async function handleAdicionar(e: FormEvent) {
    e.preventDefault();
    setErro(null);
    try {
      await lancarPontuacao.mutateAsync({
        pontos: Number(pontos),
        motivo,
        data: dataDoLancamento(mesLancamento),
      });
      setMesFiltro(mesLancamento);
      setPontos("");
      setMotivo("");
    } catch {
      setErro("Não foi possível lançar a pontuação. Confira os pontos e o motivo (mín. 3 letras).");
    }
  }

  async function handleRemover(id: string) {
    if (!confirm("Remover este lançamento de pontuação?")) return;
    await removerPontuacao.mutateAsync(id);
  }

  return (
    <section className="card p-4 lg:p-6">
      <TituloSecao
        cor="dourado"
        acao={
          <select
            value={mesFiltro}
            onChange={(e) => setMesFiltro(e.target.value)}
            className="campo h-10 w-auto max-w-[11rem] text-xs lg:h-9"
            aria-label="Mês exibido"
          >
            <option value="">Todos os meses</option>
            {mesesComPontos.map((mes) => (
              <option key={mes} value={mes}>
                {formatarMes(mes)}
              </option>
            ))}
          </select>
        }
      >
        Pontuação
      </TituloSecao>

      <div className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-nexus-gold/30 bg-gradient-to-br from-nexus-gold/[0.12] to-transparent p-4">
        <div>
          <p className="label-up flex items-center gap-1.5 text-nexus-gold">
            <Icon name="workspace_premium" filled className="text-[16px]" />
            {mesFiltro ? `Saldo de ${formatarMes(mesFiltro)}` : "Saldo geral acumulado"}
          </p>
          <p className="num mt-1 text-[40px] leading-[44px] text-nexus-gold">
            {isLoading ? "…" : saldo.toLocaleString("pt-BR")}
            <span className="ml-1 text-sm text-nexus-gold/80">PTS</span>
          </p>
          <p className="mt-1 text-xs text-slate-300">
            {noRanking && noRanking.pontos > 0
              ? `Posição #${noRanking.posicao} no ranking ${mesFiltro ? "do mês" : "deste mês"}`
              : mesFiltro
                ? "Sem posição no ranking deste mês"
                : `Total de ${data?.historico.length ?? 0} lançamentos`}
          </p>
        </div>
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-nexus-gold/40 bg-nexus-gold/15 text-nexus-gold shadow-nexus-gold">
          <Icon name="emoji_events" filled className="text-[30px]" />
        </span>
      </div>

      <form onSubmit={handleAdicionar} className="mb-5 space-y-3 rounded-xl border border-white/10 bg-nexus-bg/50 p-3 lg:p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-nexus-highlight">
            <Icon name="add_circle" className="text-[18px]" /> Lançar pontos do professor
          </p>
          <label className="flex items-center gap-2 text-xs text-slate-400">
            Mês
            <input
              required
              type="month"
              value={mesLancamento}
              onChange={(e) => setMesLancamento(e.target.value)}
              className="campo h-9 w-auto px-2 text-xs lg:h-9"
            />
          </label>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[5, 10, -5].map((valor) => (
            <button
              key={valor}
              type="button"
              onClick={() => setPontos(String(valor))}
              className={`btn min-h-[44px] border font-chivo text-base font-bold lg:min-h-[40px] ${
                pontos === String(valor)
                  ? valor > 0
                    ? "border-nexus-primary bg-nexus-primary/20 text-nexus-highlight"
                    : "border-status-vermelho bg-status-vermelho/20 text-red-400"
                  : valor > 0
                    ? "border-white/10 bg-nexus-raised text-nexus-highlight hover:border-nexus-primary/50"
                    : "border-white/10 bg-nexus-raised text-red-400 hover:border-status-vermelho/50"
              }`}
            >
              {valor > 0 ? `+${valor}` : valor}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-[5.5rem_1fr] gap-2">
          <input
            required
            type="number"
            placeholder="Pts"
            value={pontos}
            onChange={(e) => setPontos(e.target.value)}
            className="campo text-center font-chivo text-base font-bold"
            aria-label="Pontos"
          />
          <input
            required
            minLength={3}
            placeholder="Motivo (ex: destaque no treino)"
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            className="campo"
            aria-label="Motivo"
          />
        </div>
        {erro && <p className="text-xs text-red-400">{erro}</p>}
        <button type="submit" disabled={lancarPontuacao.isPending} className="btn-primario w-full">
          <Icon name="bolt" className="text-[20px]" />
          {lancarPontuacao.isPending ? "Salvando..." : `Salvar em ${formatarMes(mesLancamento || mesUtcAtual())}`}
        </button>
      </form>

      <div className="mb-2 flex items-center justify-between">
        <p className="label-up text-slate-300">
          Histórico {mesFiltro ? `(${formatarMes(mesFiltro)})` : "completo"}
        </p>
        <span className="text-xs font-semibold text-nexus-highlight">
          {historicoFiltrado.length} registros
        </span>
      </div>

      {isLoading && <Esqueleto linhas={2} altura="h-14" />}
      {data && historicoFiltrado.length === 0 && (
        <div className="flex flex-col items-center gap-1 rounded-xl border border-dashed border-white/10 p-5 text-center text-xs text-slate-400">
          <Icon name="calendar_month" className="text-[26px] text-slate-500" />
          <p className="font-semibold text-white">{mesFiltro ? formatarMes(mesFiltro) : "Sem pontos"}</p>
          Nenhuma pontuação registrada {mesFiltro ? "neste mês" : "ainda"}.
        </div>
      )}

      {historicoFiltrado.length > 0 && (
        <div className="max-h-80 space-y-2 overflow-y-auto pr-1">
          {historicoFiltrado.map((p) => {
            const automatico = p.motivo === "Presença no treino";
            const positivo = p.pontos >= 0;
            return (
              <div key={p.id} className="flex items-center gap-3 rounded-lg bg-nexus-bg/50 p-2.5">
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                    automatico
                      ? "bg-status-verde/15 text-green-400"
                      : positivo
                        ? "bg-nexus-gold/15 text-nexus-gold"
                        : "bg-status-vermelho/15 text-red-400"
                  }`}
                >
                  <Icon
                    name={automatico ? "check_circle" : positivo ? "star" : "remove_circle"}
                    className="text-[20px]"
                  />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-white">{p.motivo}</p>
                  <p className="text-xs text-slate-400">{new Date(p.data).toLocaleDateString("pt-BR")}</p>
                </div>
                <span className={`num text-base ${positivo ? "text-nexus-highlight" : "text-red-400"}`}>
                  {positivo ? `+${p.pontos}` : p.pontos} pts
                </span>
                <button
                  onClick={() => handleRemover(p.id)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-status-vermelho/10 hover:text-red-400"
                  aria-label="Remover lançamento"
                >
                  <Icon name="delete" className="text-[20px]" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

// ---------------------------------------------------------------------------
// Frequência
// ---------------------------------------------------------------------------

function SecaoFrequencia({ alunoId }: { alunoId: string }) {
  const { data: historico, isLoading } = useHistoricoFrequenciaAluno(alunoId);
  const [verTodos, setVerTodos] = useState(false);

  const raio = 42;
  const circunferencia = 2 * Math.PI * raio;
  const percentual = historico?.percentual ?? 0;
  const ultimos = historico?.historico.slice(0, 5) ?? [];

  return (
    <section className="card p-4 lg:p-6">
      <TituloSecao>Frequência em quadra</TituloSecao>
      {isLoading && <Esqueleto linhas={1} altura="h-28" />}
      {historico && (
        <>
          <div className="flex items-center gap-5">
            <div className="relative h-24 w-24 shrink-0">
              <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
                <circle cx="50" cy="50" r={raio} fill="none" strokeWidth="9" className="stroke-white/10" />
                <circle
                  cx="50"
                  cy="50"
                  r={raio}
                  fill="none"
                  strokeWidth="9"
                  strokeLinecap="round"
                  stroke="#00B4FF"
                  strokeDasharray={circunferencia}
                  strokeDashoffset={circunferencia * (1 - percentual / 100)}
                  className="transition-[stroke-dashoffset] duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="num text-2xl text-white">{percentual}%</span>
                <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">Taxa</span>
              </div>
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-white">Últimos {ultimos.length || 5} treinos</p>
              <p className="mb-2 text-xs text-slate-400">
                {historico.presencas} presenças · {historico.faltas} faltas · {historico.faltasJustificadas}{" "}
                justificadas
              </p>
              <div className="flex gap-1.5">
                {ultimos.length === 0 && <span className="text-xs text-slate-500">Sem treinos registrados.</span>}
                {ultimos.map((item) => {
                  const estilo = STATUS_FREQUENCIA[item.status];
                  return (
                    <span
                      key={item.id}
                      title={`${item.treino ? formatarData(item.treino.data.substring(0, 10)) : ""} · ${estilo.rotulo}`}
                      className={`flex h-9 w-9 items-center justify-center rounded-lg border font-chivo text-sm font-bold ${estilo.classe}`}
                    >
                      {estilo.sigla}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>

          {historico.historico.length > 0 && (
            <div className="mt-4 border-t border-white/5 pt-3">
              <button
                onClick={() => setVerTodos((v) => !v)}
                className="flex items-center gap-1 text-xs font-semibold text-nexus-highlight hover:underline"
              >
                {verTodos ? "Ocultar histórico" : `Ver histórico (${historico.totalRegistros} treinos)`}
                <Icon name={verTodos ? "expand_less" : "expand_more"} className="text-[18px]" />
              </button>
              {verTodos && (
                <div className="mt-2 max-h-60 space-y-1 overflow-y-auto pr-1 text-xs">
                  {historico.historico.map((item) => {
                    const estilo = STATUS_FREQUENCIA[item.status];
                    return (
                      <div key={item.id} className="flex justify-between border-t border-white/5 py-1.5 first:border-0">
                        <span className="text-slate-400">
                          {item.treino ? formatarData(item.treino.data.substring(0, 10)) : "—"} ·{" "}
                          {item.treino?.turma ?? "—"}
                        </span>
                        <span className={`font-semibold ${estilo.texto}`}>{estilo.rotulo}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </section>
  );
}

// ---------------------------------------------------------------------------
// Mensalidades
// ---------------------------------------------------------------------------

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
    <section className="card p-4 lg:p-6">
      <TituloSecao
        cor="dourado"
        acao={
          <button
            onClick={() => setMostrarForm((v) => !v)}
            className="flex items-center gap-1.5 rounded-lg border border-nexus-primary/40 bg-nexus-primary/10 px-3 py-2 text-xs font-semibold text-nexus-highlight transition hover:bg-nexus-primary/20"
          >
            <Icon name={mostrarForm ? "close" : "receipt_long"} className="text-[18px]" />
            {mostrarForm ? "Cancelar" : "Lançar mês"}
          </button>
        }
      >
        Mensalidades
      </TituloSecao>

      {mostrarForm && (
        <form onSubmit={handleAdicionar} className="mb-4 space-y-3 rounded-xl border border-white/10 bg-nexus-bg/50 p-3">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <label>
              <span className="rotulo">Mês</span>
              <input
                required
                type="month"
                value={mesReferencia}
                onChange={(e) => setMesReferencia(e.target.value)}
                className="campo"
              />
            </label>
            <label>
              <span className="rotulo">Valor (R$)</span>
              <input
                required
                type="number"
                step="0.01"
                placeholder="0,00"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                className="campo"
              />
            </label>
            <label>
              <span className="rotulo">Vencimento</span>
              <input
                required
                type="date"
                value={vencimento}
                onChange={(e) => setVencimento(e.target.value)}
                className="campo"
              />
            </label>
          </div>
          {erro && <p className="text-xs text-red-400">{erro}</p>}
          <button type="submit" disabled={criarMensalidade.isPending} className="btn-primario w-full">
            {criarMensalidade.isPending ? "Salvando..." : "Lançar mensalidade"}
          </button>
        </form>
      )}

      {isLoading && <Esqueleto linhas={2} altura="h-16" />}
      {mensalidades && mensalidades.length === 0 && (
        <p className="text-sm text-slate-400">Nenhuma mensalidade lançada.</p>
      )}

      {mensalidades && mensalidades.length > 0 && (
        <div className="space-y-2">
          {mensalidades.map((m) => {
            const chip = CHIP_MENSALIDADE[m.status];
            return (
              <div key={m.id} className="flex flex-wrap items-center gap-3 rounded-lg bg-nexus-bg/50 p-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/5 text-slate-300">
                  <Icon name={m.status === "pago" ? "receipt_long" : "hourglass_top"} className="text-[20px]" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-white">{formatarMes(m.mesReferencia)}</p>
                  <p className="text-xs text-slate-400">
                    {formatarMoeda(m.valor)} ·{" "}
                    {m.status === "pago" && m.dataPagamento
                      ? `pago em ${formatarData(m.dataPagamento.substring(0, 10))}`
                      : `vence em ${formatarData(m.vencimento.substring(0, 10))}`}
                  </p>
                </div>
                <span className={chip.classe}>{chip.rotulo}</span>
                <div className="flex w-full items-center justify-end gap-2 sm:w-auto">
                  <select
                    value={m.status}
                    onChange={(e) => handleMudarStatus(m.id, e.target.value as StatusMensalidade)}
                    className="campo h-9 w-auto px-2 text-xs lg:h-9"
                    aria-label="Alterar status"
                  >
                    <option value="pendente">Pendente</option>
                    <option value="pago">Pago</option>
                    <option value="atrasado">Atrasado</option>
                  </select>
                  <button
                    onClick={() => handleRemover(m.id)}
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-status-vermelho/10 hover:text-red-400"
                    aria-label="Remover mensalidade"
                  >
                    <Icon name="delete" className="text-[20px]" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

// ---------------------------------------------------------------------------
// Relatórios (avaliação do atleta)
// ---------------------------------------------------------------------------

function SecaoRelatorios({
  alunoId,
  atleta,
  abrirFormInicial,
}: {
  alunoId: string;
  atleta: { nome: string; turma: string | null };
  abrirFormInicial: boolean;
}) {
  const { data: relatorios, isLoading } = useRelatoriosDoAluno(alunoId);
  const criarRelatorio = useCriarRelatorio(alunoId);
  const removerRelatorio = useRemoverRelatorio(alunoId);
  const secaoRef = useRef<HTMLElement>(null);

  const [mostrarForm, setMostrarForm] = useState(abrirFormInicial);
  const [mesReferencia, setMesReferencia] = useState(mesUtcAtual);
  const [notas, setNotas] = useState<NotasRelatorio>(valoresIniciais);
  const [pontosFortes, setPontosFortes] = useState("");
  const [pontosMelhorar, setPontosMelhorar] = useState("");
  const [objetivoProximoMes, setObjetivoProximoMes] = useState("");
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (abrirFormInicial) secaoRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [abrirFormInicial]);

  function handleMudarNota(campo: keyof NotasRelatorio, valor: number) {
    setNotas((atual) => ({ ...atual, [campo]: valor }));
  }

  async function handleAdicionar(e: FormEvent) {
    e.preventDefault();
    setErro(null);
    try {
      await criarRelatorio.mutateAsync({
        mesReferencia,
        ...notas,
        pontosFortes,
        pontosMelhorar,
        objetivoProximoMes,
      });
      setNotas(valoresIniciais());
      setPontosFortes("");
      setPontosMelhorar("");
      setObjetivoProximoMes("");
      setMostrarForm(false);
    } catch {
      setErro("Não foi possível criar o relatório (verifique se o mês já não foi lançado).");
    }
  }

  async function handleRemover(id: string) {
    if (!confirm("Remover este relatório?")) return;
    await removerRelatorio.mutateAsync(id);
  }

  return (
    <section ref={secaoRef} className="card scroll-mt-24 p-4 lg:p-6">
      <TituloSecao
        acao={
          <button
            onClick={() => setMostrarForm((v) => !v)}
            className={mostrarForm ? "btn-secundario min-h-[40px] px-3 text-xs" : "btn-primario min-h-[40px] px-3 text-xs"}
          >
            <Icon name={mostrarForm ? "close" : "add"} className="text-[18px]" />
            {mostrarForm ? "Cancelar" : "Novo relatório"}
          </button>
        }
      >
        Avaliação do atleta
      </TituloSecao>

      {mostrarForm && (
        <form onSubmit={handleAdicionar} className="mb-4 space-y-3 rounded-xl border border-nexus-primary/30 bg-nexus-bg/50 p-3 lg:p-4">
          <label className="block max-w-xs">
            <span className="rotulo">Mês de referência</span>
            <input
              required
              type="month"
              value={mesReferencia}
              onChange={(e) => setMesReferencia(e.target.value)}
              className="campo"
            />
          </label>
          <RelatorioNotasForm notas={notas} onChange={handleMudarNota} />
          <textarea
            required
            placeholder="Pontos fortes"
            value={pontosFortes}
            onChange={(e) => setPontosFortes(e.target.value)}
            className="campo"
            rows={2}
          />
          <textarea
            required
            placeholder="Pontos a melhorar"
            value={pontosMelhorar}
            onChange={(e) => setPontosMelhorar(e.target.value)}
            className="campo"
            rows={2}
          />
          <textarea
            required
            placeholder="Objetivo para o próximo mês"
            value={objetivoProximoMes}
            onChange={(e) => setObjetivoProximoMes(e.target.value)}
            className="campo"
            rows={2}
          />
          {erro && <p className="text-xs text-red-400">{erro}</p>}
          <button type="submit" disabled={criarRelatorio.isPending} className="btn-primario w-full">
            {criarRelatorio.isPending ? "Salvando..." : "Criar relatório"}
          </button>
        </form>
      )}

      {isLoading && <Esqueleto linhas={1} altura="h-32" />}
      {relatorios && relatorios.length === 0 && !mostrarForm && (
        <p className="text-sm text-slate-400">Nenhum relatório lançado.</p>
      )}

      {relatorios && relatorios.length > 0 && (
        <div className="space-y-3">
          {relatorios.map((r) => (
            <div key={r.id} className="rounded-xl border border-white/10 bg-nexus-bg/50 p-3 text-xs lg:p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="font-chivo text-sm font-bold text-white">{formatarMes(r.mesReferencia)}</p>
                <BaixarRelatorioBotao relatorio={r} atleta={atleta} className="ml-auto mr-1" />
                <button
                  onClick={() => handleRemover(r.id)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-status-vermelho/10 hover:text-red-400"
                  aria-label="Remover relatório"
                >
                  <Icon name="delete" className="text-[18px]" />
                </button>
              </div>
              <RelatorioNotasResumo notas={r} />
              <div className="mt-2 space-y-1.5 text-slate-300">
                <p>
                  <span className="font-semibold text-nexus-highlight">Pontos fortes:</span> {r.pontosFortes}
                </p>
                <p>
                  <span className="font-semibold text-nexus-highlight">A melhorar:</span> {r.pontosMelhorar}
                </p>
              </div>
              <div className="mt-3 rounded-lg border border-nexus-gold/30 bg-nexus-gold/[0.06] p-2.5">
                <p className="label-up mb-1 flex items-center gap-1 text-nexus-gold">
                  <Icon name="flag" className="text-[14px]" /> Objetivo para o próximo mês
                </p>
                <p className="text-sm text-slate-200">{r.objetivoProximoMes}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

// ---------------------------------------------------------------------------
// Página
// ---------------------------------------------------------------------------

export function AlunoDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const abrirRelatorio = searchParams.get("relatorio") === "1";
  const { data: aluno, isLoading, isError } = useAluno(id ?? "");
  const alterarStatus = useAlterarStatusAluno();
  const removerAluno = useRemoverAluno();

  if (isLoading) return <Esqueleto linhas={3} altura="h-48" />;
  if (isError || !aluno) return <MensagemErro>Aluno não encontrado.</MensagemErro>;

  const ativo = aluno.status === "ativo";

  async function handleAlternarStatus() {
    if (!aluno) return;
    if (ativo && !confirm(`Inativar "${aluno.usuario.nome}"? Ele sai do ranking e das chamadas.`)) return;
    await alterarStatus.mutateAsync({ id: aluno.id, status: ativo ? "inativo" : "ativo" });
  }

  async function handleRemover() {
    if (!aluno) return;
    if (!confirm(`Remover o aluno "${aluno.usuario.nome}"? Esta ação não pode ser desfeita.`)) return;
    await removerAluno.mutateAsync(aluno.id);
    navigate("/admin/alunos", { replace: true });
  }

  return (
    <div>
      <Link
        to="/admin/alunos"
        className="mb-4 inline-flex items-center gap-1 rounded-lg bg-white/5 px-3 py-1.5 text-sm font-semibold text-nexus-highlight transition hover:bg-white/10"
      >
        <Icon name="arrow_back" className="text-[18px]" /> Alunos
      </Link>

      {/* Cabeçalho do atleta */}
      <section className="card mb-4 p-4 lg:mb-6 lg:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center">
          <div className="flex items-start gap-4 lg:flex-1">
            <FotoAlunoUpload alunoId={aluno.id} nome={aluno.usuario.nome} fotoUrl={aluno.fotoUrl} />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-chivo text-xl font-extrabold uppercase tracking-wide text-white lg:text-3xl">
                  {aluno.usuario.nome}
                </h1>
                <span className={ativo ? "chip-verde" : "chip-vermelho"}>{ativo ? "Ativo" : "Inativo"}</span>
              </div>
              <p className="mt-1 truncate text-sm text-slate-400">{aluno.usuario.email}</p>
              {aluno.telefone && (
                <a
                  href={`tel:${aluno.telefone}`}
                  className="mt-0.5 flex items-center gap-1 text-sm text-nexus-highlight hover:underline"
                >
                  <Icon name="call" className="text-[16px]" />
                  {aluno.telefone}
                </a>
              )}
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="chip-azul normal-case tracking-normal">
                  <span className="h-1.5 w-1.5 rounded-full bg-nexus-primary" />
                  {aluno.turma?.nome ?? "Sem turma"}
                </span>
                <span className="chip-neutro normal-case tracking-normal">
                  {idade(aluno.dataNascimento)} anos
                </span>
                <span className="chip-neutro normal-case tracking-normal">
                  <Icon name="event" className="text-[14px]" />
                  Desde {formatarData(aluno.dataEntrada.substring(0, 10))}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-[1fr_1fr_auto] gap-2 lg:flex lg:flex-col lg:items-stretch">
            <Link to={`/admin/alunos/${aluno.id}/editar`} className="btn-secundario">
              <Icon name="edit_note" className="text-[20px]" /> Editar dados
            </Link>
            <button
              onClick={handleAlternarStatus}
              disabled={alterarStatus.isPending}
              className={ativo ? "btn-perigo" : "btn-secundario"}
            >
              <Icon name={ativo ? "person_off" : "person_check"} className="text-[20px]" />
              {ativo ? "Inativar" : "Reativar"}
            </button>
            <button
              onClick={handleRemover}
              disabled={removerAluno.isPending}
              className="btn-icone hover:border-status-vermelho/60 hover:text-red-400 lg:w-full lg:gap-2 lg:text-sm"
              aria-label="Remover aluno"
              title="Remover aluno"
            >
              <Icon name="delete" className="text-[20px]" />
              <span className="hidden lg:inline">Remover</span>
            </button>
          </div>
        </div>
      </section>

      {/* No celular as seções viram uma coluna só, na ordem do protótipo
          (pontuação, frequência, mensalidades, avaliação). */}
      <div className="flex flex-col gap-4 lg:grid lg:grid-cols-12 lg:items-start lg:gap-6">
        <div className="contents lg:col-span-7 lg:flex lg:flex-col lg:gap-6">
          <div className="order-1 lg:order-none">
            <SecaoPontuacao alunoId={aluno.id} />
          </div>
          <div className="order-4 lg:order-none">
            <SecaoRelatorios
              alunoId={aluno.id}
              atleta={{ nome: aluno.usuario.nome, turma: aluno.turma?.nome ?? null }}
              abrirFormInicial={abrirRelatorio}
            />
          </div>
        </div>
        <div className="contents lg:col-span-5 lg:flex lg:flex-col lg:gap-6">
          <div className="order-2 lg:order-none">
            <SecaoFrequencia alunoId={aluno.id} />
          </div>
          <div className="order-3 lg:order-none">
            <SecaoMensalidades alunoId={aluno.id} />
          </div>
        </div>
      </div>
    </div>
  );
}
