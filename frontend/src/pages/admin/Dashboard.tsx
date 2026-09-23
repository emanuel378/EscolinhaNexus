import { Link } from "react-router-dom";
import { useAlunos } from "../../hooks/useAlunos";
import { useMensalidadesPendentes } from "../../hooks/useMensalidades";
import { useTurmas } from "../../hooks/useTurmas";
import { useTreinos } from "../../hooks/useTreinos";

function proximoTreino(treinos: { data: string; horaInicio: string; local: string; turma: { nome: string } | null }[]) {
  const hoje = new Date().toISOString().slice(0, 10);
  return treinos
    .filter((t) => t.data >= hoje)
    .sort((a, b) => a.data.localeCompare(b.data))[0];
}

function aniversariantesDoMes(alunos: { usuario: { nome: string }; dataNascimento: string }[]) {
  const mesAtual = new Date().getUTCMonth();
  return alunos
    .filter((a) => new Date(a.dataNascimento).getUTCMonth() === mesAtual)
    .sort(
      (a, b) => new Date(a.dataNascimento).getUTCDate() - new Date(b.dataNascimento).getUTCDate()
    );
}

export function AdminDashboardPage() {
  const { data: alunos } = useAlunos();
  const { data: pendentes } = useMensalidadesPendentes();
  const { data: turmas } = useTurmas();
  const { data: treinos } = useTreinos();

  const ativos = alunos?.filter((a) => a.status === "ativo").length ?? 0;
  const total = alunos?.length ?? 0;
  const treino = treinos ? proximoTreino(treinos) : undefined;
  const aniversariantes = alunos ? aniversariantesDoMes(alunos) : [];

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-bold uppercase tracking-wide text-white">
        Painel do administrador
      </h1>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-xl border border-white/10 bg-nexus-surface p-5 transition hover:border-nexus-primary/30">
          <p className="text-sm text-slate-400">Alunos ativos</p>
          <p className="mt-1 font-display text-3xl font-bold text-nexus-primary">{ativos}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-nexus-surface p-5 transition hover:border-nexus-primary/30">
          <p className="text-sm text-slate-400">Total de alunos</p>
          <p className="mt-1 font-display text-3xl font-bold text-white">{total}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-nexus-surface p-5 transition hover:border-nexus-primary/30">
          <p className="text-sm text-slate-400">Turmas ativas</p>
          <p className="mt-1 font-display text-3xl font-bold text-white">{turmas?.length ?? "—"}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-nexus-surface p-5 transition hover:border-nexus-primary/30">
          <p className="text-sm text-slate-400">Pagamentos pendentes</p>
          <p className="mt-1 font-display text-3xl font-bold text-nexus-gold">{pendentes ?? "—"}</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-nexus-surface p-5">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-300">
            Próximo treino
          </p>
          {treino ? (
            <div>
              <p className="font-display text-lg font-bold text-white">
                {treino.turma?.nome ?? "Turma"}
              </p>
              <p className="text-sm text-slate-400">
                {new Date(`${treino.data}T00:00:00`).toLocaleDateString("pt-BR", {
                  weekday: "long",
                  day: "2-digit",
                  month: "long",
                })}{" "}
                · {treino.horaInicio} · {treino.local}
              </p>
            </div>
          ) : (
            <p className="text-sm text-slate-400">Nenhum treino agendado.</p>
          )}
        </div>

        <div className="rounded-xl border border-white/10 bg-nexus-surface p-5">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-300">
            Aniversariantes do mês
          </p>
          {aniversariantes.length === 0 ? (
            <p className="text-sm text-slate-400">Nenhum aniversariante este mês.</p>
          ) : (
            <ul className="space-y-1">
              {aniversariantes.map((a) => (
                <li key={a.usuario.nome} className="flex items-center justify-between text-sm">
                  <span className="text-white">{a.usuario.nome}</span>
                  <span className="text-slate-400">
                    {new Date(a.dataNascimento).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "2-digit",
                      timeZone: "UTC",
                    })}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
        <Link
          to="/admin/alunos"
          className="text-sm font-medium text-nexus-highlight hover:text-nexus-primary hover:underline"
        >
          Ver todos os alunos →
        </Link>
        <Link
          to="/admin/turmas"
          className="text-sm font-medium text-nexus-highlight hover:text-nexus-primary hover:underline"
        >
          Gerenciar turmas →
        </Link>
        <Link
          to="/admin/treinos"
          className="text-sm font-medium text-nexus-highlight hover:text-nexus-primary hover:underline"
        >
          Gerenciar treinos →
        </Link>
      </div>
    </div>
  );
}
