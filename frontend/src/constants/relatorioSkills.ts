export const CATEGORIAS_HABILIDADES = [
  {
    key: "tecnico" as const,
    titulo: "Técnico",
    skills: [
      { key: "saque" as const, label: "Saque" },
      { key: "recepcao" as const, label: "Recepção (manchete)" },
      { key: "levantamento" as const, label: "Levantamento" },
      { key: "ataque" as const, label: "Ataque (cortada)" },
      { key: "defesa" as const, label: "Defesa" },
      { key: "controleBola" as const, label: "Controle de bola" },
      { key: "viradaBola" as const, label: "Virada de bola" },
    ],
  },
  {
    key: "fisico" as const,
    titulo: "Físico",
    skills: [
      { key: "resistencia" as const, label: "Resistência" },
      { key: "velocidade" as const, label: "Velocidade" },
      { key: "agilidade" as const, label: "Agilidade" },
      { key: "condicionamento" as const, label: "Condicionamento" },
      { key: "intensidade" as const, label: "Intensidade" },
    ],
  },
  {
    key: "tatico" as const,
    titulo: "Tático",
    skills: [
      { key: "posicionamento" as const, label: "Posicionamento" },
      { key: "tomadaDecisao" as const, label: "Tomada de decisão" },
      { key: "leituraJogo" as const, label: "Leitura de jogo" },
      { key: "estrategia" as const, label: "Estratégia" },
    ],
  },
  {
    key: "mental" as const,
    titulo: "Mental",
    skills: [
      { key: "comprometimento" as const, label: "Comprometimento" },
      { key: "concentracao" as const, label: "Concentração" },
      { key: "disciplina" as const, label: "Disciplina" },
      { key: "confianca" as const, label: "Confiança" },
      { key: "trabalhoEquipe" as const, label: "Trabalho em equipe" },
    ],
  },
];
