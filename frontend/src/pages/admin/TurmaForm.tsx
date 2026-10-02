import { FormEvent, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAtualizarTurma, useCriarTurma, useTurma } from "../../hooks/useTurmas";

const inputClass = "campo";
const labelClass = "rotulo";

export function TurmaFormPage() {
  const { id } = useParams<{ id: string }>();
  const modoEdicao = !!id;
  const navigate = useNavigate();

  const { data: turmaExistente } = useTurma(id ?? "");
  const criarTurma = useCriarTurma();
  const atualizarTurma = useAtualizarTurma(id ?? "");

  const [nome, setNome] = useState("");
  const [horarios, setHorarios] = useState("");
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (turmaExistente) {
      setNome(turmaExistente.nome);
      setHorarios(turmaExistente.horarios);
    }
  }, [turmaExistente]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErro(null);

    try {
      if (modoEdicao) {
        await atualizarTurma.mutateAsync({ nome, horarios });
      } else {
        await criarTurma.mutateAsync({ nome, horarios });
      }
      navigate("/admin/turmas");
    } catch {
      setErro("Não foi possível salvar a turma.");
    }
  }

  const enviando = criarTurma.isPending || atualizarTurma.isPending;

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="titulo-pagina mb-5 lg:mb-6">
        {modoEdicao ? "Editar turma" : "Nova turma"}
      </h1>

      <form
        onSubmit={handleSubmit}
        className="card space-y-4 p-4 lg:p-6"
      >
        <div>
          <label className={labelClass}>Nome</label>
          <input
            required
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className={inputClass}
            placeholder="Ex: Sub-15 Manhã"
          />
        </div>

        <div>
          <label className={labelClass}>Horários</label>
          <input
            required
            value={horarios}
            onChange={(e) => setHorarios(e.target.value)}
            className={inputClass}
            placeholder="Ex: Ter e Qui, 19h–21h"
          />
        </div>

        {erro && <p className="text-sm text-red-400">{erro}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={() => navigate("/admin/turmas")}
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
