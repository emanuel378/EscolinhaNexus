import { CriarRelatorioInput } from "../types";

type CampoNota = keyof Omit<
  CriarRelatorioInput,
  "mesReferencia" | "pontosFortes" | "pontosMelhorar" | "objetivoProximoMes"
>;

export interface CategoriaRelatorio {
  chave: string;
  label: string;
  campos: { campo: CampoNota; label: string }[];
}

export const RELATORIO_CATEGORIAS: CategoriaRelatorio[] = [
  {
    chave: "tecnico",
    label: "Técnico",
    campos: [
      { campo: "tecControleBola", label: "Controle de bola" },
      { campo: "tecLevantamento", label: "Levantamento" },
      { campo: "tecAtaque", label: "Ataque" },
      { campo: "tecSaque", label: "Saque" },
      { campo: "tecRecepcao", label: "Recepção" },
      { campo: "tecDefesa", label: "Defesa" },
      { campo: "tecViradaBola", label: "Virada de bola" },
    ],
  },
  {
    chave: "fisico",
    label: "Físico",
    campos: [
      { campo: "fisResistencia", label: "Resistência" },
      { campo: "fisVelocidade", label: "Velocidade" },
      { campo: "fisAgilidade", label: "Agilidade" },
      { campo: "fisCondicionamento", label: "Condicionamento" },
      { campo: "fisIntensidade", label: "Intensidade nos treinos" },
    ],
  },
  {
    chave: "tatico",
    label: "Tático",
    campos: [
      { campo: "tatPosicionamento", label: "Posicionamento" },
      { campo: "tatTomadaDecisao", label: "Tomada de decisão" },
      { campo: "tatLeituraJogo", label: "Leitura de jogo" },
      { campo: "tatEstrategia", label: "Estratégia" },
    ],
  },
  {
    chave: "mental",
    label: "Mental / Comportamental",
    campos: [
      { campo: "menComprometimento", label: "Comprometimento" },
      { campo: "menConcentracao", label: "Concentração" },
      { campo: "menDisciplina", label: "Disciplina" },
      { campo: "menConfianca", label: "Confiança" },
      { campo: "menTrabalhoEquipe", label: "Trabalho em equipe" },
    ],
  },
];

export function valoresIniciais(): Record<CampoNota, number> {
  const valores = {} as Record<CampoNota, number>;
  for (const categoria of RELATORIO_CATEGORIAS) {
    for (const { campo } of categoria.campos) {
      valores[campo] = 5;
    }
  }
  return valores;
}

export function mediaCategoria(
  notas: Record<CampoNota, number>,
  categoria: CategoriaRelatorio
): number {
  const soma = categoria.campos.reduce((acc, { campo }) => acc + notas[campo], 0);
  return Math.round((soma / categoria.campos.length) * 10) / 10;
}
