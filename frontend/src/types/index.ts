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

export interface Pontuacao {
  id: string;
  alunoId: string;
  pontos: number;
  motivo: string;
  data: string;
}

export interface HistoricoPontuacao {
  total: number;
  historico: Pontuacao[];
}

export interface LancarPontuacaoInput {
  pontos: number;
  motivo: string;
  data?: string;
}

export interface Relatorio {
  id: string;
  alunoId: string;
  mesReferencia: string;
  notaTecnico: number;
  notaFisico: number;
  notaTatico: number;
  notaMental: number;
  pontosFortes: string;
  pontosMelhorar: string;
  objetivoProximoMes: string;
  criadoEm: string;
}

export interface CriarRelatorioInput {
  mesReferencia: string;
  notaTecnico: number;
  notaFisico: number;
  notaTatico: number;
  notaMental: number;
  pontosFortes: string;
  pontosMelhorar: string;
  objetivoProximoMes: string;
}

export type AtualizarRelatorioInput = Partial<Omit<CriarRelatorioInput, "mesReferencia">>;

export interface RankingItem {
  alunoId: string;
  nome: string;
  turma: string | null;
  pontos: number;
  posicao: number;
}

export interface Ranking {
  mesReferencia: string;
  ranking: RankingItem[];
}
