import { useQuery } from "@tanstack/react-query";
import * as alunoService from "../../services/aluno.service";
import { StatusBadge } from "../../components/StatusBadge";

export function AlunoPerfilPage() {
  const { data: aluno, isLoading, isError } = useQuery({
    queryKey: ["alunos", "me"],
    queryFn: alunoService.meuPerfil,
  });

  if (isLoading) return <p className="text-sm text-slate-500">Carregando...</p>;
  if (isError || !aluno) {
    return <p className="text-sm text-status-vermelho">Não foi possível carregar seu perfil.</p>;
  }

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-6 text-lg font-semibold text-slate-900">👤 Meu perfil</h1>

      <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 text-sm">
        <div className="flex justify-between">
          <span className="text-slate-500">Nome</span>
          <span className="text-slate-900">{aluno.usuario.nome}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Email</span>
          <span className="text-slate-900">{aluno.usuario.email}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Telefone</span>
          <span className="text-slate-900">{aluno.telefone ?? "—"}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Data de nascimento</span>
          <span className="text-slate-900">
            {new Date(aluno.dataNascimento).toLocaleDateString("pt-BR")}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Turma</span>
          <span className="text-slate-900">{aluno.turma?.nome ?? "—"}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Data de entrada</span>
          <span className="text-slate-900">
            {new Date(aluno.dataEntrada).toLocaleDateString("pt-BR")}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Status</span>
          <StatusBadge status={aluno.status} />
        </div>
      </div>

      <p className="mt-4 text-xs text-slate-400">
        Precisa atualizar algum dado? Fale com o professor — apenas o administrador pode editar
        essas informações.
      </p>
    </div>
  );
}
