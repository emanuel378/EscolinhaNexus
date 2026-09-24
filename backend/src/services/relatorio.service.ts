import { supabaseAdmin } from "../lib/supabase";
import { AppError } from "../middlewares/errorHandler";

interface RelatorioInput {
  mesReferencia: string;
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
  pontosFortes: string;
  pontosMelhorar: string;
  objetivoProximoMes: string;
}

interface RelatorioRow {
  id: string;
  aluno_id: string;
  mes_referencia: string;
  tec_controle_bola: number;
  tec_levantamento: number;
  tec_ataque: number;
  tec_saque: number;
  tec_recepcao: number;
  tec_defesa: number;
  tec_virada_bola: number;
  fis_resistencia: number;
  fis_velocidade: number;
  fis_agilidade: number;
  fis_condicionamento: number;
  fis_intensidade: number;
  tat_posicionamento: number;
  tat_tomada_decisao: number;
  tat_leitura_jogo: number;
  tat_estrategia: number;
  men_comprometimento: number;
  men_concentracao: number;
  men_disciplina: number;
  men_confianca: number;
  men_trabalho_equipe: number;
  pontos_fortes: string;
  pontos_melhorar: string;
  objetivo_proximo_mes: string;
  criado_em: string;
}

function paraApi(row: RelatorioRow) {
  return {
    id: row.id,
    alunoId: row.aluno_id,
    mesReferencia: row.mes_referencia,
    tecControleBola: row.tec_controle_bola,
    tecLevantamento: row.tec_levantamento,
    tecAtaque: row.tec_ataque,
    tecSaque: row.tec_saque,
    tecRecepcao: row.tec_recepcao,
    tecDefesa: row.tec_defesa,
    tecViradaBola: row.tec_virada_bola,
    fisResistencia: row.fis_resistencia,
    fisVelocidade: row.fis_velocidade,
    fisAgilidade: row.fis_agilidade,
    fisCondicionamento: row.fis_condicionamento,
    fisIntensidade: row.fis_intensidade,
    tatPosicionamento: row.tat_posicionamento,
    tatTomadaDecisao: row.tat_tomada_decisao,
    tatLeituraJogo: row.tat_leitura_jogo,
    tatEstrategia: row.tat_estrategia,
    menComprometimento: row.men_comprometimento,
    menConcentracao: row.men_concentracao,
    menDisciplina: row.men_disciplina,
    menConfianca: row.men_confianca,
    menTrabalhoEquipe: row.men_trabalho_equipe,
    pontosFortes: row.pontos_fortes,
    pontosMelhorar: row.pontos_melhorar,
    objetivoProximoMes: row.objetivo_proximo_mes,
    criadoEm: row.criado_em,
  };
}

function paraColunas(input: Partial<RelatorioInput>) {
  return {
    ...(input.tecControleBola !== undefined ? { tec_controle_bola: input.tecControleBola } : {}),
    ...(input.tecLevantamento !== undefined ? { tec_levantamento: input.tecLevantamento } : {}),
    ...(input.tecAtaque !== undefined ? { tec_ataque: input.tecAtaque } : {}),
    ...(input.tecSaque !== undefined ? { tec_saque: input.tecSaque } : {}),
    ...(input.tecRecepcao !== undefined ? { tec_recepcao: input.tecRecepcao } : {}),
    ...(input.tecDefesa !== undefined ? { tec_defesa: input.tecDefesa } : {}),
    ...(input.tecViradaBola !== undefined ? { tec_virada_bola: input.tecViradaBola } : {}),
    ...(input.fisResistencia !== undefined ? { fis_resistencia: input.fisResistencia } : {}),
    ...(input.fisVelocidade !== undefined ? { fis_velocidade: input.fisVelocidade } : {}),
    ...(input.fisAgilidade !== undefined ? { fis_agilidade: input.fisAgilidade } : {}),
    ...(input.fisCondicionamento !== undefined
      ? { fis_condicionamento: input.fisCondicionamento }
      : {}),
    ...(input.fisIntensidade !== undefined ? { fis_intensidade: input.fisIntensidade } : {}),
    ...(input.tatPosicionamento !== undefined
      ? { tat_posicionamento: input.tatPosicionamento }
      : {}),
    ...(input.tatTomadaDecisao !== undefined
      ? { tat_tomada_decisao: input.tatTomadaDecisao }
      : {}),
    ...(input.tatLeituraJogo !== undefined ? { tat_leitura_jogo: input.tatLeituraJogo } : {}),
    ...(input.tatEstrategia !== undefined ? { tat_estrategia: input.tatEstrategia } : {}),
    ...(input.menComprometimento !== undefined
      ? { men_comprometimento: input.menComprometimento }
      : {}),
    ...(input.menConcentracao !== undefined ? { men_concentracao: input.menConcentracao } : {}),
    ...(input.menDisciplina !== undefined ? { men_disciplina: input.menDisciplina } : {}),
    ...(input.menConfianca !== undefined ? { men_confianca: input.menConfianca } : {}),
    ...(input.menTrabalhoEquipe !== undefined
      ? { men_trabalho_equipe: input.menTrabalhoEquipe }
      : {}),
    ...(input.pontosFortes !== undefined ? { pontos_fortes: input.pontosFortes } : {}),
    ...(input.pontosMelhorar !== undefined ? { pontos_melhorar: input.pontosMelhorar } : {}),
    ...(input.objetivoProximoMes !== undefined
      ? { objetivo_proximo_mes: input.objetivoProximoMes }
      : {}),
  };
}

export async function listarRelatoriosDoAluno(alunoId: string) {
  const { data, error } = await supabaseAdmin
    .from("relatorios")
    .select("*")
    .eq("aluno_id", alunoId)
    .order("mes_referencia", { ascending: false })
    .returns<RelatorioRow[]>();

  if (error) throw new AppError(`Erro ao listar relatórios: ${error.message}`, 500);
  return data.map(paraApi);
}

interface AlunoAtivoRow {
  id: string;
  foto_url: string | null;
  usuarios: { nome: string } | null;
  turmas: { nome: string } | null;
}

// Status do relatório de cada aluno ativo num mês: usado no dashboard (X de
// Y lançados) e na tela do admin que lista quem ainda falta ter relatório.
export async function listarStatusRelatoriosDoMes(mesReferencia: string) {
  const { data: alunos, error: alunosError } = await supabaseAdmin
    .from("alunos")
    .select("id, foto_url, usuarios ( nome ), turmas ( nome )")
    .eq("status", "ativo")
    .returns<AlunoAtivoRow[]>();

  if (alunosError) throw new AppError(`Erro ao listar alunos: ${alunosError.message}`, 500);

  const alunoIds = alunos.map((a) => a.id);
  let relatorios: { id: string; aluno_id: string }[] = [];

  if (alunoIds.length > 0) {
    const { data, error } = await supabaseAdmin
      .from("relatorios")
      .select("id, aluno_id")
      .eq("mes_referencia", mesReferencia)
      .in("aluno_id", alunoIds)
      .returns<{ id: string; aluno_id: string }[]>();

    if (error) throw new AppError(`Erro ao listar relatórios do mês: ${error.message}`, 500);
    relatorios = data;
  }

  const relatorioPorAluno = new Map(relatorios.map((r) => [r.aluno_id, r.id]));

  return alunos
    .map((a) => ({
      alunoId: a.id,
      nome: a.usuarios?.nome ?? "—",
      fotoUrl: a.foto_url,
      turma: a.turmas?.nome ?? null,
      relatorioId: relatorioPorAluno.get(a.id) ?? null,
    }))
    .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
}

export async function criarRelatorio(alunoId: string, input: RelatorioInput) {
  const { data: existente } = await supabaseAdmin
    .from("relatorios")
    .select("id")
    .eq("aluno_id", alunoId)
    .eq("mes_referencia", input.mesReferencia)
    .maybeSingle();

  if (existente) {
    throw new AppError("Já existe um relatório lançado para este mês de referência.", 409);
  }

  const { data, error } = await supabaseAdmin
    .from("relatorios")
    .insert({
      aluno_id: alunoId,
      mes_referencia: input.mesReferencia,
      ...paraColunas(input),
    })
    .select("*")
    .single<RelatorioRow>();

  if (error) throw new AppError(`Erro ao criar relatório: ${error.message}`, 500);
  return paraApi(data);
}

export async function atualizarRelatorio(id: string, input: Partial<RelatorioInput>) {
  const { data: atual, error: atualError } = await supabaseAdmin
    .from("relatorios")
    .select("id")
    .eq("id", id)
    .maybeSingle();

  if (atualError) throw new AppError(`Erro ao buscar relatório: ${atualError.message}`, 500);
  if (!atual) throw new AppError("Relatório não encontrado.", 404);

  const { data, error } = await supabaseAdmin
    .from("relatorios")
    .update(paraColunas(input))
    .eq("id", id)
    .select("*")
    .single<RelatorioRow>();

  if (error) throw new AppError(`Erro ao atualizar relatório: ${error.message}`, 500);
  return paraApi(data);
}

export async function removerRelatorio(id: string) {
  const { error } = await supabaseAdmin.from("relatorios").delete().eq("id", id);
  if (error) throw new AppError(`Erro ao remover relatório: ${error.message}`, 500);
}
