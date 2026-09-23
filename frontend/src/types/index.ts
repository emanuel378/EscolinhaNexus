export type Role = "admin" | "aluno";

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  role: Role;
  criadoEm?: string;
}

export type StatusAluno = "ativo" | "inativo";

export interface Turma {
  id: string;
  nome: string;
  horarios: string;
}

export interface Aluno {
  id: string;
  dataNascimento: string;
  telefone: string | null;
  dataEntrada: string;
  turmaId: string | null;
  status: StatusAluno;
  fotoUrl: string | null;
  criadoEm: string;
  atualizadoEm: string;
  usuario: {
    id: string;
    nome: string;
    email: string;
    criadoEm: string;
  };
  turma: Turma | null;
}

export interface CriarAlunoInput {
  nome: string;
  email: string;
  senha: string;
  dataNascimento: string;
  telefone?: string;
  turmaId?: string;
  fotoUrl?: string;
}

export interface AtualizarAlunoInput {
  nome?: string;
  email?: string;
  dataNascimento?: string;
  telefone?: string;
  turmaId?: string | null;
  fotoUrl?: string;
  status?: StatusAluno;
}

export interface CriarTurmaInput {
  nome: string;
  horarios: string;
}

export type AtualizarTurmaInput = Partial<CriarTurmaInput>;

export interface Treino {
  id: string;
  turmaId: string;
  data: string;
  horaInicio: string;
  horaFim: string;
  local: string;
  tipo: string;
  observacao: string | null;
  criadoEm: string;
  turma: { id: string; nome: string } | null;
}

export interface CriarTreinoInput {
  turmaId: string;
  data: string;
  horaInicio: string;
  horaFim: string;
  local: string;
  tipo: string;
  observacao?: string;
}

export type AtualizarTreinoInput = Partial<CriarTreinoInput>;

export type StatusFrequencia = "presente" | "falta" | "falta_justificada";

export interface FichaChamadaItem {
  alunoId: string;
  nome: string;
  status: StatusFrequencia | null;
}

export interface HistoricoFrequenciaItem {
  id: string;
  status: StatusFrequencia;
  treino: {
    id: string;
    data: string;
    tipo: string;
    horaInicio: string;
    turma: string | null;
  } | null;
}

export interface HistoricoFrequencia {
  percentual: number;
  totalRegistros: number;
  presencas: number;
  faltas: number;
  faltasJustificadas: number;
  historico: HistoricoFrequenciaItem[];
}

export type StatusMensalidade = "pago" | "pendente" | "atrasado";

export interface Mensalidade {
  id: string;
  alunoId: string;
  mesReferencia: string;
  valor: number;
  vencimento: string;
  dataPagamento: string | null;
  status: StatusMensalidade;
  criadoEm: string;
}

export interface CriarMensalidadeInput {
  mesReferencia: string;
  valor: number;
  vencimento: string;
  dataPagamento?: string;
  status?: StatusMensalidade;
}

export interface AtualizarMensalidadeInput {
  valor?: number;
  vencimento?: string;
  dataPagamento?: string | null;
  status?: StatusMensalidade;
}

export interface HabilidadesTecnico {
  controleBola: number;
  levantamento: number;
  ataque: number;
  saque: number;
  recepcao: number;
  defesa: number;
  viradaBola: number;
}

export interface HabilidadesFisico {
  resistencia: number;
  velocidade: number;
  agilidade: number;
  condicionamento: number;
  intensidade: number;
}

export interface HabilidadesTatico {
  posicionamento: number;
  tomadaDecisao: number;
  leituraJogo: number;
  estrategia: number;
}

export interface HabilidadesMental {
  comprometimento: number;
  concentracao: number;
  disciplina: number;
  confianca: number;
  trabalhoEquipe: number;
}

export interface Habilidades {
  tecnico: HabilidadesTecnico;
  fisico: HabilidadesFisico;
  tatico: HabilidadesTatico;
  mental: HabilidadesMental;
}

export interface Relatorio {
  id: string;
  alunoId: string;
  mesReferencia: string;
  pontosFortes: string;
  pontosMelhorar: string;
  objetivoProximoMes: string;
  criadoEm: string;
  habilidades: Habilidades;
  medias: {
    tecnico: number;
    fisico: number;
    tatico: number;
    mental: number;
    geral: number;
  };
}

export interface EnviarRelatorioInput extends Habilidades {
  mesReferencia: string;
  pontosFortes: string;
  pontosMelhorar: string;
  objetivoProximoMes: string;
}
