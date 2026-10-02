import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAlunos } from "../../hooks/useAlunos";
import { useRanking } from "../../hooks/useRanking";
import { useTurmas } from "../../hooks/useTurmas";
import { Icon } from "../../components/Icon";
import {
  AvatarAtleta,
  Barra,
  CabecalhoPagina,
  Esqueleto,
  EstadoVazio,
  MensagemErro,
} from "../../components/AdminUI";
import { mesAtual } from "../../utils/data";

type FiltroStatus = "todos" | "ativo" | "inativo";

function normalizar(texto: string) {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

export function AlunosListPage() {
  const [busca, setBusca] = useState("");
  const [status, setStatus] = useState<FiltroStatus>("todos");
  const [turmaId, setTurmaId] = useState("");

  const { data: alunos, isLoading, isError } = useAlunos();
  const { data: turmas } = useTurmas();
  // Pontos e frequência do mês vêm do ranking (só inclui alunos ativos).
  const { data: ranking } = useRanking({ mesReferencia: mesAtual() });

  const rankingPorAluno = useMemo(
    () => new Map(ranking?.ranking.map((r) => [r.alunoId, r]) ?? []),
    [ranking]
  );

  const contagem = {
    todos: alunos?.length ?? 0,
    ativo: alunos?.filter((a) => a.status === "ativo").length ?? 0,
    inativo: alunos?.filter((a) => a.status === "inativo").length ?? 0,
  };

  const filtrados = useMemo(() => {
    const termo = normalizar(busca.trim());
    return (alunos ?? [])
      .filter((a) => status === "todos" || a.status === status)
      .filter((a) => !turmaId || a.turmaId === turmaId)
      .filter(
        (a) =>
          !termo ||
          normalizar(
            [a.usuario.nome, a.usuario.email, a.turma?.nome ?? "", a.telefone ?? ""].join(" ")
          ).includes(termo)
      )
      .sort((a, b) => a.usuario.nome.localeCompare(b.usuario.nome, "pt-BR"));
  }, [alunos, busca, status, turmaId]);

  const chipClasse = (ativo: boolean) =>
    `inline-flex h-10 shrink-0 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition ${
      ativo
        ? "border-nexus-primary/60 bg-nexus-primary/15 text-nexus-highlight shadow-[0_0_12px_rgba(0,180,255,0.25)]"
        : "border-white/10 bg-nexus-surface text-slate-300 hover:border-white/20"
    }`;

  return (
    <div>
      <CabecalhoPagina
        titulo="Atletas & Alunos"
        subtitulo={
          <>
            <span className="font-semibold text-nexus-primary">{contagem.ativo}</span> atletas ativos
            no centro
          </>
        }
        acao={
          <Link to="/admin/alunos/novo" className="btn-primario shadow-nexus-glow">
            <Icon name="person_add" className="text-[20px]" />
            Novo
          </Link>
        }
      />

      <div className="relative mb-4">
        <Icon
          name="search"
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[22px] text-slate-400"
        />
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar por nome, email, telefone ou turma..."
          className="campo h-12 pl-12 lg:h-12"
        />
      </div>

      <div className="-mx-4 mb-5 flex gap-2 overflow-x-auto px-4 pb-1 lg:mx-0 lg:flex-wrap lg:px-0">
        {(
          [
            ["todos", "Todos"],
            ["ativo", "Ativos"],
            ["inativo", "Inativos"],
          ] as const
        ).map(([valor, rotulo]) => (
          <button key={valor} onClick={() => setStatus(valor)} className={chipClasse(status === valor)}>
            {rotulo}
            <span className="rounded-full bg-white/10 px-2 text-xs">{contagem[valor]}</span>
          </button>
        ))}
        {turmas && turmas.length > 0 && <span className="mx-1 w-px shrink-0 self-stretch bg-white/10" />}
        {turmas?.map((t) => (
          <button
            key={t.id}
            onClick={() => setTurmaId((atual) => (atual === t.id ? "" : t.id))}
            className={chipClasse(turmaId === t.id)}
          >
            {t.nome}
          </button>
        ))}
      </div>

      {isLoading && <Esqueleto linhas={4} altura="h-36" />}
      {isError && <MensagemErro>Erro ao carregar alunos.</MensagemErro>}

      {alunos && filtrados.length === 0 && (
        <EstadoVazio icone="person_search">
          {alunos.length === 0 ? "Nenhum aluno cadastrado." : "Nenhum aluno encontrado com esses filtros."}
        </EstadoVazio>
      )}

      {filtrados.length > 0 && (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 2xl:grid-cols-3 lg:gap-4">
          {filtrados.map((aluno) => {
            const doMes = rankingPorAluno.get(aluno.id);
            const ativo = aluno.status === "ativo";
            return (
              <Link
                key={aluno.id}
                to={`/admin/alunos/${aluno.id}`}
                className="card group block p-4 transition hover:border-nexus-primary/40 hover:shadow-nexus-glow"
              >
                <div className="flex items-start gap-3">
                  <span className="relative">
                    <AvatarAtleta
                      nome={aluno.usuario.nome}
                      fotoUrl={aluno.fotoUrl}
                      destaque={doMes?.posicao === 1 && doMes.pontos > 0}
                    />
                    <span
                      className={`absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-nexus-surface ${
                        ativo ? "bg-nexus-primary" : "bg-red-400"
                      }`}
                    />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-chivo text-lg font-bold text-white">
                      {aluno.usuario.nome}
                    </p>
                    <p className="truncate text-sm text-slate-400">{aluno.turma?.nome ?? "Sem turma"}</p>
                  </div>
                  <span className={ativo ? "chip-azul" : "chip-vermelho"}>{ativo ? "Ativo" : "Inativo"}</span>
                  <Icon
                    name="chevron_right"
                    className="text-[22px] text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-white"
                  />
                </div>

                <div className="mt-3 flex items-center gap-3 rounded-lg bg-nexus-bg/60 px-3 py-2.5">
                  <Icon name="emoji_events" className="text-[22px] text-nexus-gold" />
                  <span className="num text-xl text-nexus-gold">
                    {doMes ? doMes.pontos.toLocaleString("pt-BR") : "—"}
                  </span>
                  <span className="text-xs font-semibold text-slate-400">pts</span>
                  <div className="ml-auto flex min-w-0 items-center gap-2">
                    <Barra valor={doMes?.frequenciaPercentual ?? 0} className="hidden w-16 sm:block xl:w-20" />
                    <span className="num text-sm text-white">
                      {doMes?.frequenciaPercentual != null ? `${doMes.frequenciaPercentual}%` : "—"}
                    </span>
                    <span className="label-up text-slate-400">Presenças</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
