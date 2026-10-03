// Gera a "folha" do relatório mensal em PDF (A4) para download.
// O jsPDF é importado sob demanda para não pesar no carregamento do app.
import type { jsPDF as JsPDF } from "jspdf";
import { Relatorio } from "../types";
import { RELATORIO_CATEGORIAS, mediaCategoria } from "./relatorio";

const MESES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

type RGB = [number, number, number];

const COR = {
  fundo: [5, 11, 20] as RGB,
  ciano: [0, 180, 255] as RGB,
  cianoEscuro: [0, 101, 145] as RGB,
  dourado: [255, 210, 0] as RGB,
  douradoEscuro: [150, 110, 0] as RGB,
  verde: [22, 163, 74] as RGB,
  amarelo: [202, 138, 4] as RGB,
  texto: [30, 41, 59] as RGB,
  textoSuave: [100, 116, 139] as RGB,
  caixa: [244, 248, 252] as RGB,
  borda: [213, 222, 232] as RGB,
  trilho: [226, 232, 240] as RGB,
};

const MARGEM = 14;
const LARGURA_PAGINA = 210;
const ALTURA_PAGINA = 297;
const LARGURA_UTIL = LARGURA_PAGINA - MARGEM * 2;

function formatarMes(mesReferencia: string) {
  const [ano, mes] = mesReferencia.split("-");
  return `${MESES[Number(mes) - 1]} / ${ano}`;
}

function slug(texto: string) {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function corDaNota(nota: number): RGB {
  if (nota >= 8) return COR.verde;
  if (nota >= 5) return COR.ciano;
  return COR.amarelo;
}

async function carregarLogo(): Promise<string | null> {
  try {
    const resposta = await fetch("/images/nexus-logo.jpg");
    if (!resposta.ok) return null;
    const blob = await resposta.blob();
    return await new Promise((resolve) => {
      const leitor = new FileReader();
      leitor.onload = () => resolve(leitor.result as string);
      leitor.onerror = () => resolve(null);
      leitor.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

function cabecalho(doc: JsPDF, relatorio: Relatorio, logo: string | null, mediaGeral: number) {
  doc.setFillColor(...COR.fundo);
  doc.rect(0, 0, LARGURA_PAGINA, 36, "F");
  doc.setFillColor(...COR.ciano);
  doc.rect(0, 36, LARGURA_PAGINA, 1.2, "F");

  const xTexto = logo ? MARGEM + 25 : MARGEM;
  if (logo) doc.addImage(logo, "JPEG", MARGEM, 8, 20, 20);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...COR.ciano);
  doc.text("NEXUS CT VÔLEI", xTexto, 15);

  doc.setFontSize(17);
  doc.setTextColor(255, 255, 255);
  doc.text("Relatório mensal de desempenho", xTexto, 24);

  doc.setFontSize(12);
  doc.setTextColor(...COR.dourado);
  doc.text(formatarMes(relatorio.mesReferencia), LARGURA_PAGINA - MARGEM, 15, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(200, 210, 222);
  doc.text("Média geral", LARGURA_PAGINA - MARGEM - 14, 25, { align: "right" });
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(...COR.dourado);
  doc.text(mediaGeral.toFixed(1), LARGURA_PAGINA - MARGEM, 26, { align: "right" });
}

function dadosDoAtleta(doc: JsPDF, nome: string, turma: string | null) {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...COR.textoSuave);
  doc.text("ATLETA", MARGEM, 46);
  doc.text("TURMA", 120, 46);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(...COR.texto);
  doc.text(doc.splitTextToSize(nome, 100)[0], MARGEM, 52);
  doc.setFontSize(11);
  doc.text(doc.splitTextToSize(turma ?? "-", LARGURA_PAGINA - MARGEM - 120)[0], 120, 52);

  doc.setDrawColor(...COR.borda);
  doc.setLineWidth(0.3);
  doc.line(MARGEM, 56, LARGURA_PAGINA - MARGEM, 56);
}

const ALTURA_ITEM = 6.6;
const CABECALHO_CAIXA = 12;

function alturaCategoria(qtdItens: number) {
  return CABECALHO_CAIXA + qtdItens * ALTURA_ITEM + 3;
}

function caixaCategoria(
  doc: JsPDF,
  relatorio: Relatorio,
  indice: number,
  x: number,
  y: number,
  largura: number,
  altura: number
) {
  const categoria = RELATORIO_CATEGORIAS[indice];
  const media = mediaCategoria(relatorio, categoria);

  doc.setFillColor(...COR.caixa);
  doc.setDrawColor(...COR.borda);
  doc.setLineWidth(0.3);
  doc.roundedRect(x, y, largura, altura, 2.5, 2.5, "FD");
  doc.setFillColor(...COR.ciano);
  doc.rect(x, y + 3, 1.2, 7, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...COR.cianoEscuro);
  doc.text(categoria.label.toUpperCase(), x + 4, y + 8);

  // Selo com a média da categoria
  doc.setFillColor(...corDaNota(media));
  doc.roundedRect(x + largura - 17, y + 3, 14, 7, 1.5, 1.5, "F");
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text(media.toFixed(1), x + largura - 10, y + 8, { align: "center" });

  const xBarra = x + 44;
  const larguraBarra = largura - 44 - 12;
  categoria.campos.forEach(({ campo, label }, i) => {
    const nota = relatorio[campo];
    const yLinha = y + CABECALHO_CAIXA + 4 + i * ALTURA_ITEM;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...COR.texto);
    doc.text(doc.splitTextToSize(label, 40)[0], x + 4, yLinha);

    doc.setFillColor(...COR.trilho);
    doc.roundedRect(xBarra, yLinha - 2.4, larguraBarra, 2.8, 1.2, 1.2, "F");
    if (nota > 0) {
      doc.setFillColor(...corDaNota(nota));
      doc.roundedRect(xBarra, yLinha - 2.4, (larguraBarra * nota) / 10, 2.8, 1.2, 1.2, "F");
    }

    doc.setFont("helvetica", "bold");
    doc.text(String(nota), x + largura - 4, yLinha, { align: "right" });
  });
}

function caixaTexto(
  doc: JsPDF,
  y: number,
  titulo: string,
  texto: string,
  cor: RGB,
  destaque = false
): number {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  const linhas: string[] = doc.splitTextToSize(texto || "-", LARGURA_UTIL - 10);
  const altura = 11 + linhas.length * 4.6 + 2;

  if (y + altura > ALTURA_PAGINA - 22) {
    doc.addPage();
    y = 20;
  }

  if (destaque) {
    doc.setFillColor(255, 249, 219);
    doc.setDrawColor(...COR.dourado);
  } else {
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(...COR.borda);
  }
  doc.setLineWidth(0.3);
  doc.roundedRect(MARGEM, y, LARGURA_UTIL, altura, 2.5, 2.5, "FD");
  doc.setFillColor(...cor);
  doc.rect(MARGEM, y + 3, 1.2, 6, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...(destaque ? COR.douradoEscuro : cor));
  doc.text(titulo.toUpperCase(), MARGEM + 4, y + 7.5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(...COR.texto);
  doc.text(linhas, MARGEM + 4, y + 13.5);

  return y + altura + 4;
}

function rodape(doc: JsPDF) {
  const paginas = doc.getNumberOfPages();
  const emitido = new Date().toLocaleDateString("pt-BR");
  for (let p = 1; p <= paginas; p++) {
    doc.setPage(p);
    doc.setDrawColor(...COR.borda);
    doc.setLineWidth(0.3);
    doc.line(MARGEM, ALTURA_PAGINA - 12, LARGURA_PAGINA - MARGEM, ALTURA_PAGINA - 12);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...COR.textoSuave);
    doc.text(`Nexus CT Vôlei · emitido em ${emitido}`, MARGEM, ALTURA_PAGINA - 7);
    doc.text(`Página ${p} de ${paginas}`, LARGURA_PAGINA - MARGEM, ALTURA_PAGINA - 7, { align: "right" });
  }
}

interface DadosAtleta {
  nome: string;
  turma: string | null;
}

export async function gerarRelatorioPdf(relatorio: Relatorio, atleta: DadosAtleta) {
  const [{ jsPDF }, logo] = await Promise.all([import("jspdf"), carregarLogo()]);
  const doc = new jsPDF({ unit: "mm", format: "a4" });

  const medias = RELATORIO_CATEGORIAS.map((c) => mediaCategoria(relatorio, c));
  const mediaGeral = medias.reduce((a, b) => a + b, 0) / medias.length;

  cabecalho(doc, relatorio, logo, mediaGeral);
  dadosDoAtleta(doc, atleta.nome, atleta.turma);

  // Notas: 4 categorias em grade 2x2
  const gap = 5;
  const largura = (LARGURA_UTIL - gap) / 2;
  let y = 61;
  for (let linha = 0; linha < 2; linha++) {
    const [a, b] = [linha * 2, linha * 2 + 1];
    const altura = Math.max(
      alturaCategoria(RELATORIO_CATEGORIAS[a].campos.length),
      alturaCategoria(RELATORIO_CATEGORIAS[b].campos.length)
    );
    caixaCategoria(doc, relatorio, a, MARGEM, y, largura, altura);
    caixaCategoria(doc, relatorio, b, MARGEM + largura + gap, y, largura, altura);
    y += altura + gap;
  }

  y = caixaTexto(doc, y, "Pontos fortes", relatorio.pontosFortes, COR.verde);
  y = caixaTexto(doc, y, "Pontos a melhorar", relatorio.pontosMelhorar, COR.amarelo);
  y = caixaTexto(doc, y, "Objetivo para o próximo mês", relatorio.objetivoProximoMes, COR.dourado, true);

  // Assinatura do treinador, se couber na página
  if (y + 16 < ALTURA_PAGINA - 14) {
    const yAssinatura = Math.max(y + 12, ALTURA_PAGINA - 26);
    doc.setDrawColor(...COR.textoSuave);
    doc.line(LARGURA_PAGINA - MARGEM - 70, yAssinatura, LARGURA_PAGINA - MARGEM, yAssinatura);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...COR.textoSuave);
    doc.text("Treinador(a) responsável", LARGURA_PAGINA - MARGEM - 35, yAssinatura + 4, { align: "center" });
  }

  rodape(doc);
  return doc;
}

export async function baixarRelatorioPdf(relatorio: Relatorio, atleta: DadosAtleta) {
  const doc = await gerarRelatorioPdf(relatorio, atleta);
  doc.save(`relatorio-${slug(atleta.nome)}-${relatorio.mesReferencia}.pdf`);
}
