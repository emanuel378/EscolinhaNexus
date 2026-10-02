import { FormEvent, useEffect, useState } from "react";
import { isAxiosError } from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { useAluno, useAtualizarAluno, useCriarAluno } from "../../hooks/useAlunos";
import { useTurmas } from "../../hooks/useTurmas";

const inputClass = "campo";
const labelClass = "rotulo";

// Usa a mensagem do backend (ex.: email já cadastrado, senha fraca) em vez
// de um texto genérico, para o admin saber o que corrigir.
function mensagemDeErro(err: unknown) {
  if (isAxiosError<{ message?: string; erros?: { mensagem: string }[] }>(err) && err.response?.data) {
    const { message, erros } = err.response.data;
    if (erros?.length) return erros.map((e) => e.mensagem).join(" ");
    if (message) return message;
  }
  return "Não foi possível salvar o aluno. Verifique os dados informados.";
}

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
    } catch (err) {
      setErro(mensagemDeErro(err));
    }
  }

  const enviando = criarAluno.isPending || atualizarAluno.isPending;

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="titulo-pagina mb-5 lg:mb-6">
        {modoEdicao ? "Editar aluno" : "Novo aluno"}
      </h1>

      <form
        onSubmit={handleSubmit}
        className="card space-y-4 p-4 lg:p-6"
      >
        <div>
          <label className={labelClass}>Nome</label>
          <input required value={nome} onChange={(e) => setNome(e.target.value)} className={inputClass} />
        </div>

        <div>
          <label className={labelClass}>Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
          />
        </div>

        {!modoEdicao && (
          <div>
            <label className={labelClass}>Senha inicial</label>
            <input
              type="password"
              required
              minLength={6}
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className={inputClass}
              placeholder="Mínimo 6 caracteres"
            />
          </div>
        )}

        <div>
          <label className={labelClass}>Data de nascimento</label>
          <input
            type="date"
            required
            value={dataNascimento}
            onChange={(e) => setDataNascimento(e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Telefone</label>
          <input
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
            className={inputClass}
            placeholder="(00) 00000-0000"
          />
        </div>

        <div>
          <label className={labelClass}>Data de entrada na escolinha</label>
          <input
            type="date"
            required
            value={dataEntrada}
            onChange={(e) => setDataEntrada(e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Turma</label>
          <select value={turmaId} onChange={(e) => setTurmaId(e.target.value)} className={inputClass}>
            <option value="">Sem turma</option>
            {turmas?.map((t) => (
              <option key={t.id} value={t.id}>
                {t.nome}
              </option>
            ))}
          </select>
        </div>

        {erro && <p className="text-sm text-red-400">{erro}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={() => navigate("/admin/alunos")}
            className="btn-secundario flex-1 sm:flex-none"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={enviando}
            className="btn-primario flex-1 sm:flex-none sm:px-8"
          >
            {enviando ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </form>
    </div>
  );
}
