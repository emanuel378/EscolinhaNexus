import { ChangeEvent, useRef, useState } from "react";
import { useRemoverFotoAluno, useUploadFotoAluno } from "../hooks/useAlunos";
import { Avatar } from "./Avatar";

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
      setErro("Não foi possível enviar a foto. Use JPEG, PNG ou WEBP de até 5MB.");
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
    <div className="flex items-center gap-4">
      <Avatar nome={nome} fotoUrl={fotoUrl} tamanho="lg" />
      <div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploadFoto.isPending}
            className="rounded-lg border border-white/10 px-3 py-1 text-xs text-slate-300 transition hover:bg-white/10 hover:text-white disabled:opacity-60"
          >
            {uploadFoto.isPending ? "Enviando..." : fotoUrl ? "Trocar foto" : "Adicionar foto"}
          </button>
          {fotoUrl && (
            <button
              type="button"
              onClick={handleRemover}
              disabled={removerFoto.isPending}
              className="rounded-lg border border-status-vermelho/30 px-3 py-1 text-xs text-status-vermelho transition hover:bg-status-vermelho/10 disabled:opacity-60"
            >
              Remover
            </button>
          )}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleSelecionar}
          className="hidden"
        />
        {erro && <p className="mt-1 text-xs text-red-400">{erro}</p>}
      </div>
    </div>
  );
}
