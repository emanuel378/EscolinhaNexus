import { useQuery } from "@tanstack/react-query";
import * as alunoService from "../../services/aluno.service";
import { StatusBadge } from "../../components/StatusBadge";
import { Avatar } from "../../components/Avatar";
import { Spinner } from "../../components/Spinner";

export function AlunoPerfilPage() {
  const { data: aluno, isLoading, isError } = useQuery({
    queryKey: ["alunos", "me"],
    queryFn: alunoService.meuPerfil,
  });

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-slate-400">
        <Spinner /> Carregando...
      </div>
    );
  }
  if (isError || !aluno) {
    return <p className="text-sm text-red-400">Não foi possível carregar seu perfil.</p>;
  }

  return (
    <div className="mx-auto max-w-lg">
      <div className="mb-6 flex items-center gap-3">
        <Avatar nome={aluno.usuario.nome} fotoUrl={aluno.fotoUrl} tamanho="lg" />
        <h1 className="font-display text-2xl font-bold uppercase tracking-wide text-white">
          Meu perfil
        </h1>
      </div>

      <div className="space-y-4 rounded-xl border border-white/10 bg-nexus-surface p-6 text-sm">
        <div className="flex justify-between">
          <span className="text-slate-400">Nome</span>
          <span className="text-white">{aluno.usuario.nome}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Email</span>
          <span className="text-white">{aluno.usuario.email}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Telefone</span>
          <span className="text-white">{aluno.telefone ?? "—"}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Data de nascimento</span>
          <span className="text-white">
            {new Date(aluno.dataNascimento).toLocaleDateString("pt-BR")}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Turma</span>
          <span className="text-white">{aluno.turma?.nome ?? "—"}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Data de entrada</span>
          <span className="text-white">
            {new Date(aluno.dataEntrada).toLocaleDateString("pt-BR")}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Status</span>
          <StatusBadge status={aluno.status} />
        </div>
      </div>

      <p className="mt-4 text-xs text-slate-500">
        Precisa atualizar algum dado? Fale com o professor — apenas o administrador pode editar
        essas informações.
      </p>
    </div>
  );
}
