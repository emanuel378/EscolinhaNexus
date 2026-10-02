// Peças visuais compartilhadas pelas telas do admin.
import { ReactNode } from "react";
import { Avatar } from "./Avatar";
import { Icon } from "./Icon";

/** Cabeçalho de página: rótulo ciano em caixa alta + título + ação opcional. */
export function CabecalhoPagina({
  rotulo,
  titulo,
  subtitulo,
  acao,
}: {
  rotulo?: string;
  titulo: string;
  subtitulo?: ReactNode;
  acao?: ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3 lg:mb-6">
      <div className="min-w-0">
        {rotulo && <p className="label-up mb-1 text-nexus-primary">{rotulo}</p>}
        <h1 className="titulo-pagina">{titulo}</h1>
        {subtitulo && <p className="mt-1 text-sm text-slate-400">{subtitulo}</p>}
      </div>
      {acao}
    </div>
  );
}

/** Título de seção dentro de um card, com a marca colorida à esquerda. */
export function TituloSecao({
  children,
  cor = "azul",
  acao,
}: {
  children: ReactNode;
  cor?: "azul" | "dourado";
  acao?: ReactNode;
}) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <h2 className="flex items-center gap-2.5 font-chivo text-base font-bold uppercase tracking-wide text-white lg:text-lg">
        <span
          className={`h-5 w-1.5 rounded-full ${cor === "dourado" ? "bg-nexus-gold" : "bg-nexus-primary"}`}
        />
        {children}
      </h2>
      {acao}
    </div>
  );
}

export function EstadoVazio({ icone = "inbox", children }: { icone?: string; children: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-white/10 bg-nexus-surface/50 px-4 py-8 text-center text-sm text-slate-400">
      <Icon name={icone} className="text-[32px] text-slate-500" />
      {children}
    </div>
  );
}

export function MensagemErro({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-start gap-2 rounded-xl border border-status-vermelho/40 bg-status-vermelho/10 p-3 text-sm text-red-300">
      <Icon name="error" className="text-[20px] text-red-400" />
      <span>{children}</span>
    </div>
  );
}

/** Placeholder de carregamento (skeleton) com N linhas de card. */
export function Esqueleto({ linhas = 3, altura = "h-24" }: { linhas?: number; altura?: string }) {
  return (
    <div className="space-y-3" role="status" aria-label="Carregando">
      {Array.from({ length: linhas }, (_, i) => (
        <div key={i} className={`card ${altura} animate-pulse bg-nexus-surface/70`} />
      ))}
    </div>
  );
}

/** Avatar com anel colorido (dourado para destaque, ciano para o resto). */
export function AvatarAtleta({
  nome,
  fotoUrl,
  tamanho = "md",
  destaque = false,
}: {
  nome: string;
  fotoUrl: string | null;
  tamanho?: "sm" | "md" | "lg" | "xl";
  destaque?: boolean;
}) {
  return (
    <span
      className={`inline-flex shrink-0 rounded-full p-[2px] ${
        destaque ? "bg-nexus-gold shadow-nexus-gold" : "bg-nexus-primary/60"
      }`}
    >
      <span className="rounded-full bg-nexus-bg p-[1px]">
        <Avatar nome={nome} fotoUrl={fotoUrl} tamanho={tamanho} />
      </span>
    </span>
  );
}

/** Barra de progresso fina (0–100). */
export function Barra({
  valor,
  cor = "azul",
  className = "",
}: {
  valor: number;
  cor?: "azul" | "dourado" | "verde";
  className?: string;
}) {
  const cores = {
    azul: "bg-gradient-to-r from-nexus-primary to-nexus-highlight",
    dourado: "bg-nexus-gold",
    verde: "bg-status-verde",
  };
  return (
    <div className={`h-2 w-full overflow-hidden rounded-full bg-white/10 ${className}`}>
      <div
        className={`h-full rounded-full transition-[width] duration-700 ease-out ${cores[cor]}`}
        style={{ width: `${Math.max(0, Math.min(100, valor))}%` }}
      />
    </div>
  );
}
