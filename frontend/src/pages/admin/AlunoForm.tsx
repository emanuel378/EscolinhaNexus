import { FormEvent, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAluno, useAtualizarAluno, useCriarAluno } from "../../hooks/useAlunos";
import { useTurmas } from "../../hooks/useTurmas";

const inputClass =
  "w-full rounded-lg border border-white/10 bg-nexus-bg/60 px-3 py-2 text-sm text-white placeholder-slate-500 outline-none transition focus:border-nexus-primary focus:ring-2 focus:ring-nexus-primary/40";
const labelClass = "mb-1 block text-sm font-medium text-slate-300";

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
      <h1 className="mb-6 font-display text-2xl font-bold uppercase tracking-wide text-white">
        {modoEdicao ? "Editar aluno" : "Novo aluno"}
      </h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-xl border border-white/10 bg-nexus-surface p-6"
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
            className="rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-300 transition hover:bg-white/10 hover:text-white"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={enviando}
            className="rounded-lg bg-nexus-primary px-4 py-2 text-sm font-semibold text-nexus-bg shadow-nexus-glow transition hover:bg-nexus-highlight disabled:opacity-60"
          >
            {enviando ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </form>
    </div>
  );
}
