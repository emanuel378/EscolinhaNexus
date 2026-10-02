import { useState } from "react";
import { Link } from "react-router-dom";
import { useStatusRelatoriosDoMes } from "../../hooks/useRelatorios";
import { Icon } from "../../components/Icon";
import { AvatarAtleta, Barra, CabecalhoPagina, Esqueleto, EstadoVazio } from "../../components/AdminUI";
import { mesAtual } from "../../utils/data";

export function RelatoriosStatusPage() {
  const [mesReferencia, setMesReferencia] = useState(mesAtual());
  const [soPendentes, setSoPendentes] = useState(false);
  const { data, isLoading } = useStatusRelatoriosDoMes(mesReferencia);

  const lancados = data?.alunos.filter((a) => a.relatorioId !== null).length ?? 0;
  const total = data?.alunos.length ?? 0;
  const progresso = total > 0 ? Math.round((lancados / total) * 100) : 0;
  const alunos = (data?.alunos ?? []).filter((a) => !soPendentes || a.relatorioId === null);

  return (
    <div>
      <CabecalhoPagina rotulo="Avaliações técnicas" titulo="Relatórios mensais" />

      <section className="card mb-5 p-4 lg:p-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="label-up text-nexus-primary">Progresso do mês</p>
            <p className="num mt-1 text-4xl text-white">
              {lancados}
              <span className="text-lg text-slate-400"> de {total}</span>
            </p>
            <p className="text-sm text-slate-400">atletas avaliados</p>
          </div>
          <input
            type="month"
            value={mesReferencia}
            onChange={(e) => setMesReferencia(e.target.value || mesAtual())}
            className="campo w-auto"
            aria-label="Mês de referência"
          />
        </div>
        <Barra valor={progresso} className="mt-4 h-2.5" />
        <label className="mt-4 flex w-fit cursor-pointer items-center gap-2 text-sm text-slate-300">
          <input
            type="checkbox"
            checked={soPendentes}
            onChange={(e) => setSoPendentes(e.target.checked)}
            className="h-4 w-4 accent-nexus-primary"
          />
          Mostrar só pendentes
        </label>
      </section>

      {isLoading && <Esqueleto linhas={4} altura="h-16" />}
      {data && alunos.length === 0 && (
        <EstadoVazio icone="task_alt">
          {total === 0 ? "Nenhum aluno ativo encontrado." : "Todos os relatórios do mês foram lançados!"}
        </EstadoVazio>
      )}

      {alunos.length > 0 && (
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:gap-3">
          {alunos.map((aluno) => (
            <Link
              key={aluno.alunoId}
              to={`/admin/alunos/${aluno.alunoId}${aluno.relatorioId ? "" : "?relatorio=1"}`}
              className="card flex items-center gap-3 p-3 transition hover:border-nexus-primary/30"
            >
              <AvatarAtleta nome={aluno.nome} fotoUrl={aluno.fotoUrl} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-white">{aluno.nome}</p>
                <p className="truncate text-xs text-slate-400">{aluno.turma ?? "—"}</p>
              </div>
              <span className={aluno.relatorioId ? "chip-verde" : "chip-amarelo"}>
                {aluno.relatorioId ? "Lançado" : "Pendente"}
              </span>
              <Icon
                name={aluno.relatorioId ? "chevron_right" : "edit_note"}
                className={`text-[22px] ${aluno.relatorioId ? "text-slate-500" : "text-nexus-highlight"}`}
              />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
