import { iniciais } from "../utils/nome";

const TAMANHOS = {
  sm: "h-8 w-8 text-xs",
  md: "h-12 w-12 text-sm",
  lg: "h-16 w-16 text-lg",
} as const;

export function Avatar({
  nome,
  fotoUrl,
  tamanho = "md",
}: {
  nome: string;
  fotoUrl: string | null;
  tamanho?: keyof typeof TAMANHOS;
}) {
  const classeTamanho = TAMANHOS[tamanho];

  if (fotoUrl) {
    return (
      <img
        src={fotoUrl}
        alt={nome}
        className={`${classeTamanho} shrink-0 rounded-full object-cover`}
      />
    );
  }

  return (
    <div
      className={`flex ${classeTamanho} shrink-0 items-center justify-center rounded-full bg-slate-900 font-semibold text-white`}
    >
      {iniciais(nome)}
    </div>
  );
}
