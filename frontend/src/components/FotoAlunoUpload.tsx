import { ChangeEvent, useRef, useState } from "react";
import { useRemoverFotoAluno, useUploadFotoAluno } from "../hooks/useAlunos";
import { Avatar } from "./Avatar";
import { Icon } from "./Icon";

// Foto grande do atleta com botão de câmera sobreposto (trocar) e link para
// remover. Usada no cabeçalho de "Detalhes do atleta".
export function FotoAlunoUpload({
  alunoId,
  nome,
  fotoUrl,
}: {
  alunoId: string;
  nome: string;
  fotoUrl: string | null;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const uploadFoto = useUploadFotoAluno(alunoId);
  const removerFoto = useRemoverFotoAluno(alunoId);
  const [erro, setErro] = useState<string | null>(null);

  async function handleSelecionar(e: ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0];
    e.target.value = "";
    if (!arquivo) return;

    setErro(null);
    try {
      await uploadFoto.mutateAsync(arquivo);
    } catch {
      setErro("Não foi possível enviar a foto. Use JPEG, PNG ou WEBP de até 4MB.");
    }
  }

  async function handleRemover() {
    if (!confirm("Remover a foto deste aluno?")) return;
    setErro(null);
    try {
      await removerFoto.mutateAsync();
    } catch {
      setErro("Não foi possível remover a foto.");
    }
  }

  return (
    <div className="flex shrink-0 flex-col items-center gap-1.5">
      <div className="relative">
        <span className="inline-flex rounded-2xl bg-gradient-to-br from-nexus-gold to-nexus-primary p-[3px] shadow-nexus-glow">
          <span className="rounded-[14px] bg-nexus-bg p-0.5 [&>*]:!h-20 [&>*]:!w-20 [&>*]:!rounded-xl lg:[&>*]:!h-28 lg:[&>*]:!w-28">
            <Avatar nome={nome} fotoUrl={fotoUrl} tamanho="xl" />
          </span>
        </span>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploadFoto.isPending}
          title={fotoUrl ? "Trocar foto" : "Adicionar foto"}
          aria-label={fotoUrl ? "Trocar foto" : "Adicionar foto"}
          className="absolute -bottom-2 -right-2 flex h-9 w-9 items-center justify-center rounded-full border-2 border-nexus-bg bg-nexus-primary text-nexus-bg shadow-nexus-glow transition hover:bg-nexus-highlight disabled:opacity-60"
        >
          <Icon
            name={uploadFoto.isPending ? "progress_activity" : "photo_camera"}
            className={`text-[18px] ${uploadFoto.isPending ? "animate-spin" : ""}`}
          />
        </button>
      </div>
      {fotoUrl && (
        <button
          type="button"
          onClick={handleRemover}
          disabled={removerFoto.isPending}
          className="mt-1 text-[11px] text-slate-500 transition hover:text-red-400 disabled:opacity-60"
        >
          Remover foto
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleSelecionar}
        className="hidden"
      />
      {erro && <p className="max-w-[9rem] text-center text-[11px] text-red-400">{erro}</p>}
    </div>
  );
}
