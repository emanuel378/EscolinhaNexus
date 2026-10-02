import { Link } from "react-router-dom";
import { useRemoverTurma, useTurmas } from "../../hooks/useTurmas";
import { useAlunos } from "../../hooks/useAlunos";
import { Icon } from "../../components/Icon";
import { CabecalhoPagina, Esqueleto, EstadoVazio, MensagemErro } from "../../components/AdminUI";
import { AbasTreinosTurmas } from "../../components/TreinoCard";

export function TurmasListPage() {
  const { data: turmas, isLoading, isError } = useTurmas();
  const { data: alunosAtivos } = useAlunos("ativo");
  const removerTurma = useRemoverTurma();

  function alunosNaTurma(turmaId: string) {
    return alunosAtivos?.filter((a) => a.turmaId === turmaId).length ?? 0;
  }

  async function handleRemover(id: string, nome: string) {
    if (!confirm(`Remover a turma "${nome}"? Treinos vinculados também serão removidos.`)) {
      return;
    }
    await removerTurma.mutateAsync(id);
  }

  return (
    <div>
      <CabecalhoPagina
        rotulo="Operação de quadra"
        titulo="Gestão de treinos & turmas"
        acao={
          <Link to="/admin/turmas/nova" className="btn-primario shadow-nexus-glow">
            <Icon name="group_add" className="text-[20px]" /> Nova turma
          </Link>
        }
      />

      <AbasTreinosTurmas />

      {isLoading && <Esqueleto linhas={3} altura="h-28" />}
      {isError && <MensagemErro>Erro ao carregar turmas.</MensagemErro>}
      {turmas && turmas.length === 0 && <EstadoVazio icone="groups">Nenhuma turma cadastrada.</EstadoVazio>}

      {turmas && turmas.length > 0 && (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 2xl:grid-cols-3 lg:gap-4">
          {turmas.map((turma) => (
            <div key={turma.id} className="card flex flex-col p-4 transition hover:border-nexus-primary/30">
              <div className="flex items-start gap-3">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-nexus-primary/10 text-nexus-primary">
                  <Icon name="groups" className="text-[26px]" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-chivo text-lg font-extrabold text-white">{turma.nome}</p>
                  <p className="flex items-center gap-1 text-sm text-slate-400">
                    <Icon name="schedule" className="text-[16px]" />
                    {turma.horarios}
                  </p>
                </div>
                <span className="text-right">
                  <span className="num block text-2xl text-nexus-primary">{alunosNaTurma(turma.id)}</span>
                  <span className="label-up text-slate-500">atletas</span>
                </span>
              </div>
              <div className="mt-4 flex gap-2">
                <Link to={`/admin/turmas/${turma.id}/editar`} className="btn-secundario flex-1">
                  <Icon name="edit" className="text-[18px]" /> Editar
                </Link>
                <button onClick={() => handleRemover(turma.id, turma.nome)} className="btn-perigo flex-1">
                  <Icon name="delete" className="text-[18px]" /> Excluir
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
