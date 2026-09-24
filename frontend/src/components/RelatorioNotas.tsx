import { useState } from "react";
import { NotasRelatorio } from "../types";
import { RELATORIO_CATEGORIAS, mediaCategoria } from "../utils/relatorio";
import { SkillBar } from "./SkillBar";

export function RelatorioNotasForm({
  notas,
  onChange,
}: {
  notas: NotasRelatorio;
  onChange: (campo: keyof NotasRelatorio, valor: number) => void;
}) {
  return (
    <div className="space-y-4">
      {RELATORIO_CATEGORIAS.map((categoria) => (
        <div key={categoria.chave} className="rounded-lg border border-white/10 p-3">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-nexus-highlight">
            {categoria.label}
          </p>
          <div className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
            {categoria.campos.map(({ campo, label }) => (
              <label key={campo} className="block text-xs text-slate-300">
                <span className="flex items-center justify-between">
                  {label}
                  <span className="font-semibold text-white">{notas[campo]}</span>
                </span>
                <input
                  type="range"
                  min={0}
                  max={10}
                  step={1}
                  value={notas[campo]}
                  onChange={(e) => onChange(campo, Number(e.target.value))}
                  className="mt-1.5 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-nexus-primary"
                />
              </label>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function RelatorioNotasResumo({ notas }: { notas: NotasRelatorio }) {
  const [expandido, setExpandido] = useState(false);

  return (
    <div>
      <div className="mb-2 grid grid-cols-4 gap-2 text-center">
        {RELATORIO_CATEGORIAS.map((categoria) => (
          <div key={categoria.chave}>
            <p className="text-[11px] text-slate-400">{categoria.label.split(" / ")[0]}</p>
            <p className="font-display text-lg font-bold text-nexus-primary">
              {mediaCategoria(notas, categoria)}
            </p>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => setExpandido((v) => !v)}
        className="mb-2 text-xs text-nexus-highlight hover:underline"
      >
        {expandido ? "Ocultar detalhes por item" : "Ver detalhes por item"}
      </button>

      {expandido && (
        <div className="space-y-3 rounded-lg bg-white/5 p-3">
          {RELATORIO_CATEGORIAS.map((categoria) => (
            <div key={categoria.chave}>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
                {categoria.label}
              </p>
              <div className="grid grid-cols-1 gap-x-4 gap-y-1.5 sm:grid-cols-2">
                {categoria.campos.map(({ campo, label }) => (
                  <SkillBar key={campo} label={label} value={notas[campo]} max={10} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
