import { ChangeEvent, useRef, useState } from "react";
import { useRemoverFotoAluno, useUploadFotoAluno } from "../hooks/useAlunos";
import { iniciais } from "../utils/nome";

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
      {fotoUrl ? (
        <img src={fotoUrl} alt={nome} className="h-16 w-16 rounded-full object-cover" />
      ) : (
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-900 text-lg font-semibold text-white">
          {iniciais(nome)}
        </div>
      )}
      <div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploadFoto.isPending}
            className="rounded-lg border border-slate-300 px-3 py-1 text-xs hover:bg-slate-100 disabled:opacity-60"
          >
            {uploadFoto.isPending ? "Enviando..." : fotoUrl ? "Trocar foto" : "Adicionar foto"}
          </button>
          {fotoUrl && (
            <button
              type="button"
              onClick={handleRemover}
              disabled={removerFoto.isPending}
              className="rounded-lg border border-red-200 px-3 py-1 text-xs text-status-vermelho hover:bg-red-50 disabled:opacity-60"
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
        {erro && <p className="mt-1 text-xs text-status-vermelho">{erro}</p>}
      </div>
    </div>
  );
}
