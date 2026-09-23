import { FormEvent, useState } from "react";
import { StarRating } from "./StarRating";
import { CATEGORIAS_HABILIDADES } from "../constants/relatorioSkills";
import { EnviarRelatorioInput } from "../types";

type CategoriaKey = "tecnico" | "fisico" | "tatico" | "mental";

function valorInicial(): EnviarRelatorioInput {
  return {
    mesReferencia: new Date().toISOString().slice(0, 7),
    pontosFortes: "",
    pontosMelhorar: "",
    objetivoProximoMes: "",
    tecnico: {
      controleBola: 3,
      levantamento: 3,
      ataque: 3,
      saque: 3,
      recepcao: 3,
      defesa: 3,
      viradaBola: 3,
    },
    fisico: { resistencia: 3, velocidade: 3, agilidade: 3, condicionamento: 3, intensidade: 3 },
    tatico: { posicionamento: 3, tomadaDecisao: 3, leituraJogo: 3, estrategia: 3 },
    mental: { comprometimento: 3, concentracao: 3, disciplina: 3, confianca: 3, trabalhoEquipe: 3 },
  };
}

const textareaClass =
  "w-full rounded-lg border border-white/10 bg-nexus-bg/60 px-3 py-2 text-sm text-white placeholder-slate-500 outline-none transition focus:border-nexus-primary focus:ring-2 focus:ring-nexus-primary/40";

interface RelatorioFormProps {
  onEnviar: (input: EnviarRelatorioInput) => Promise<unknown>;
  onCancelar: () => void;
  enviando: boolean;
}

export function RelatorioForm({ onEnviar, onCancelar, enviando }: RelatorioFormProps) {
  const [form, setForm] = useState<EnviarRelatorioInput>(valorInicial);
  const [erro, setErro] = useState<string | null>(null);

  function atualizarNota(categoria: CategoriaKey, skillKey: string, valor: number) {
    setForm((prev) => ({
      ...prev,
      [categoria]: { ...prev[categoria], [skillKey]: valor },
    }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErro(null);
    try {
      await onEnviar(form);
    } catch {
      setErro("Não foi possível enviar o relatório. Verifique os campos e tente novamente.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mb-4 space-y-4 rounded-lg bg-white/5 p-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-300">Mês de referência</label>
        <input
          type="month"
          required
          value={form.mesReferencia}
          onChange={(e) => setForm((prev) => ({ ...prev, mesReferencia: e.target.value }))}
          className="rounded-lg border border-white/10 bg-nexus-bg/60 px-3 py-2 text-sm text-white outline-none transition focus:border-nexus-primary focus:ring-2 focus:ring-nexus-primary/40"
        />
      </div>

      {CATEGORIAS_HABILIDADES.map((categoria) => (
        <div key={categoria.key} className="rounded-lg border border-white/10 p-3">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-nexus-highlight">
            {categoria.titulo}
          </h3>
          <div className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
            {categoria.skills.map((skill) => (
              <div key={skill.key} className="flex items-center justify-between gap-3">
                <span className="text-sm text-slate-300">{skill.label}</span>
                <StarRating
                  value={(form[categoria.key] as unknown as Record<string, number>)[skill.key]}
                  onChange={(valor) => atualizarNota(categoria.key, skill.key, valor)}
                />
              </div>
            ))}
          </div>
        </div>
      ))}

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-300">Pontos fortes</label>
        <textarea
          required
          rows={2}
          value={form.pontosFortes}
          onChange={(e) => setForm((prev) => ({ ...prev, pontosFortes: e.target.value }))}
          className={textareaClass}
          placeholder="Ex: Saque muito consistente, boa liderança em quadra..."
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-300">Pontos a melhorar</label>
        <textarea
          required
          rows={2}
          value={form.pontosMelhorar}
          onChange={(e) => setForm((prev) => ({ ...prev, pontosMelhorar: e.target.value }))}
          className={textareaClass}
          placeholder="Ex: Precisa treinar recepção de saques mais fortes..."
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-300">
          Objetivo para o próximo mês
        </label>
        <textarea
          required
          rows={2}
          value={form.objetivoProximoMes}
          onChange={(e) => setForm((prev) => ({ ...prev, objetivoProximoMes: e.target.value }))}
          className={textareaClass}
          placeholder="Ex: Treinar manchete de recepção 3x por semana..."
        />
      </div>

      {erro && <p className="text-sm text-red-400">{erro}</p>}

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancelar}
          className="rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-300 transition hover:bg-white/10 hover:text-white"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={enviando}
          className="rounded-lg bg-nexus-primary px-4 py-2 text-sm font-semibold text-nexus-bg shadow-nexus-glow transition hover:bg-nexus-highlight disabled:opacity-60"
        >
          {enviando ? "Enviando..." : "Enviar relatório"}
        </button>
      </div>
    </form>
  );
}
