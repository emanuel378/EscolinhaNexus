import { useState } from "react";
import { NotasRelatorio } from "../types";
import { RELATORIO_CATEGORIAS, mediaCategoria } from "../utils/relatorio";

export function RelatorioNotasForm({
  notas,
  onChange,
}: {
  notas: NotasRelatorio;
  onChange: (campo: keyof NotasRelatorio, valor: number) => void;
}) {
  return (
    <div className="space-y-3">
      {RELATORIO_CATEGORIAS.map((categoria) => (
        <div key={categoria.chave}>
          <p className="mb-1 text-xs font-medium text-slate-700">{categoria.label}</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {categoria.campos.map(({ campo, label }) => (
              <label key={campo} className="text-xs text-slate-500">
                {label}
                <input
                  required
                  type="number"
                  min={0}
                  max={10}
                  value={notas[campo]}
                  onChange={(e) => onChange(campo, Number(e.target.value))}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-2 py-1.5 text-xs"
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
            <p className="text-slate-500">{categoria.label.split(" / ")[0]}</p>
            <p className="font-semibold text-slate-900">{mediaCategoria(notas, categoria)}</p>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => setExpandido((v) => !v)}
        className="mb-2 text-xs text-slate-500 hover:underline"
      >
        {expandido ? "Ocultar detalhes por item" : "Ver detalhes por item"}
      </button>

      {expandido && (
        <div className="space-y-2 rounded-lg bg-slate-50 p-2">
          {RELATORIO_CATEGORIAS.map((categoria) => (
            <div key={categoria.chave}>
              <p className="text-xs font-medium text-slate-700">{categoria.label}</p>
              <div className="grid grid-cols-2 gap-x-3 sm:grid-cols-3">
                {categoria.campos.map(({ campo, label }) => (
                  <p key={campo} className="flex justify-between text-xs text-slate-500">
                    <span>{label}</span>
                    <span className="font-medium text-slate-900">{notas[campo]}</span>
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
