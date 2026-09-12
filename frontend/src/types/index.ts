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
  dataEntrada?: string;
  turmaId?: string;
  fotoUrl?: string;
}

export interface AtualizarAlunoInput {
  nome?: string;
  email?: string;
  dataNascimento?: string;
  telefone?: string;
  dataEntrada?: string;
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

export interface NotasRelatorio {
  tecControleBola: number;
  tecLevantamento: number;
  tecAtaque: number;
  tecSaque: number;
  tecRecepcao: number;
  tecDefesa: number;
  tecViradaBola: number;
  fisResistencia: number;
  fisVelocidade: number;
  fisAgilidade: number;
  fisCondicionamento: number;
  fisIntensidade: number;
  tatPosicionamento: number;
  tatTomadaDecisao: number;
  tatLeituraJogo: number;
  tatEstrategia: number;
  menComprometimento: number;
  menConcentracao: number;
  menDisciplina: number;
  menConfianca: number;
  menTrabalhoEquipe: number;
}

export interface Relatorio extends NotasRelatorio {
  id: string;
  alunoId: string;
  mesReferencia: string;
  pontosFortes: string;
  pontosMelhorar: string;
  objetivoProximoMes: string;
  criadoEm: string;
}

export interface CriarRelatorioInput extends NotasRelatorio {
  mesReferencia: string;
  pontosFortes: string;
  pontosMelhorar: string;
  objetivoProximoMes: string;
}

export type AtualizarRelatorioInput = Partial<Omit<CriarRelatorioInput, "mesReferencia">>;

export interface StatusRelatorioItem {
  alunoId: string;
  nome: string;
  turma: string | null;
  relatorioId: string | null;
}

export interface StatusRelatoriosMes {
  mesReferencia: string;
  alunos: StatusRelatorioItem[];
}

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

export interface ProximoTreinoResumo {
  id: string;
  data: string;
  horaInicio: string;
  horaFim: string;
  local: string;
  tipo: string;
  turma: string | null;
}

export interface DashboardResumo {
  mesReferencia: string;
  alunosAtivos: number;
  alunosInativos: number;
  alunosNovos: number;
  alunosSairamEsteMes: number;
  pagamentos: { pago: number; pendente: number; atrasado: number };
  frequenciaMediaMes: number;
  relatoriosLancados: number;
  relatoriosTotal: number;
  rankingTop: RankingItem[];
  proximosTreinos: ProximoTreinoResumo[];
}

export interface CalendarioDia {
  treinoId: string;
  data: string;
  horaInicio: string;
  horaFim: string;
  tipo: string;
  local: string;
  status: StatusFrequencia | null;
}

export interface CalendarioMensal {
  mesReferencia: string;
  dias: CalendarioDia[];
}

export interface HistoricoMensalItem {
  mesReferencia: string;
  posicao: number | null;
  pontos: number;
  frequenciaPercentual: number | null;
  relatorioDisponivel: boolean;
}
