import { FormEvent, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAluno, useAtualizarAluno, useCriarAluno } from "../../hooks/useAlunos";
import { useTurmas } from "../../hooks/useTurmas";

function hojeISO() {
  return new Date().toISOString().substring(0, 10);
}

export function AlunoFormPage() {
  const { id } = useParams<{ id: string }>();
  const modoEdicao = !!id;
  const navigate = useNavigate();

  const { data: alunoExistente } = useAluno(id ?? "");
  const { data: turmas } = useTurmas();
  const criarAluno = useCriarAluno();
  const atualizarAluno = useAtualizarAluno(id ?? "");

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [telefone, setTelefone] = useState("");
  const [dataEntrada, setDataEntrada] = useState(hojeISO());
  const [turmaId, setTurmaId] = useState("");
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (alunoExistente) {
      setNome(alunoExistente.usuario.nome);
      setEmail(alunoExistente.usuario.email);
      setDataNascimento(alunoExistente.dataNascimento.substring(0, 10));
      setTelefone(alunoExistente.telefone ?? "");
      setDataEntrada(alunoExistente.dataEntrada.substring(0, 10));
      setTurmaId(alunoExistente.turmaId ?? "");
    }
  }, [alunoExistente]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErro(null);

    try {
      if (modoEdicao) {
        await atualizarAluno.mutateAsync({
          nome,
          email,
          dataNascimento,
          telefone: telefone || undefined,
          dataEntrada: dataEntrada || undefined,
          turmaId: turmaId || null,
        });
      } else {
        await criarAluno.mutateAsync({
          nome,
          email,
          senha,
          dataNascimento,
          telefone: telefone || undefined,
          dataEntrada: dataEntrada || undefined,
          turmaId: turmaId || undefined,
        });
      }
      navigate("/admin/alunos");
    } catch {
      setErro("Não foi possível salvar o aluno. Verifique os dados informados.");
    }
  }

  const enviando = criarAluno.isPending || atualizarAluno.isPending;

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-6 text-lg font-semibold text-slate-900">
        {modoEdicao ? "Editar aluno" : "Novo aluno"}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Nome</label>
          <input
            required
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>

        {!modoEdicao && (
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Senha inicial
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              placeholder="Mínimo 6 caracteres"
            />
          </div>
        )}

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Data de nascimento
          </label>
          <input
            type="date"
            required
            value={dataNascimento}
            onChange={(e) => setDataNascimento(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Telefone
          </label>
          <input
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            placeholder="(00) 00000-0000"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Data de entrada na escolinha
          </label>
          <input
            type="date"
            required
            value={dataEntrada}
            onChange={(e) => setDataEntrada(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Turma</label>
          <select
            value={turmaId}
            onChange={(e) => setTurmaId(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="">Sem turma</option>
            {turmas?.map((t) => (
              <option key={t.id} value={t.id}>
                {t.nome}
              </option>
            ))}
          </select>
        </div>

        {erro && <p className="text-sm text-status-vermelho">{erro}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={() => navigate("/admin/alunos")}
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
