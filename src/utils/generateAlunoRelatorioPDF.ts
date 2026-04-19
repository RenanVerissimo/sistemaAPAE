import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { User } from "@/types";

interface RelatorioCampos {
  historicoClinico?: string;
  objetivos?: string;
  tecnicas?: string;
  evolucao?: string;
  recomendacoes?: string;
}

interface GeneratePDFParams {
  aluno: User;
  profissional: User;
  campos: RelatorioCampos;
}

export function generateAlunoRelatorioPDF({
  aluno,
  profissional,
  campos
}: GeneratePDFParams) {
  const doc = new jsPDF();

  // ===== TÍTULO =====
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("RELATÓRIO CLÍNICO DO PACIENTE", 105, 15, { align: "center" });

  // ===== DADOS DO ALUNO =====
  autoTable(doc, {
    startY: 25,
    theme: "grid",
    styles: { fontSize: 10 },
    body: [
      ["Nome", aluno.nome],
      ["CPF", aluno.cpf || "-"],
      ["Prontuário", aluno.prontuario || "000000"],
      ["CNS", aluno.cartaoSUS || "-"],
      ["Descrição", aluno.descricao || "-"],
    ],
  });

  let y = (doc as any).lastAutoTable.finalY + 15;

  // Função para criar seções com espaçamento ajustado
  const section = (titulo: string, texto?: string, rows: number = 3) => {
    // Verifica se precisa adicionar nova página
    if (y > 250) {
      doc.addPage();
      y = 20;
    }

    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(titulo, 14, y);
    y += 7;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    
    if (texto && texto.trim()) {
      const split = doc.splitTextToSize(texto, 180);
      doc.text(split, 14, y);
      y += split.length * 5 + 8;
    } else {
      // Linhas vazias para preenchimento manual
      for (let i = 0; i < rows; i++) {
        doc.line(14, y, 196, y);
        y += 8;
      }
      y += 5;
    }
  };

  // ===== SEÇÕES COM ESPAÇAMENTOS AJUSTADOS =====
  section("HISTÓRICO CLÍNICO", campos.historicoClinico, 3);
  section("OBJETIVOS DO TRATAMENTO", campos.objetivos, 3);
  section("TÉCNICAS E PROCEDIMENTOS APLICADOS", campos.tecnicas, 5);
  section("EVOLUÇÃO OU RETROCESSO DO PACIENTE", campos.evolucao, 6);
  section("RECOMENDAÇÕES FINAIS", campos.recomendacoes, 5);

  // ===== ASSINATURA DO PROFISSIONAL =====
  // Verifica se precisa adicionar nova página para assinatura
  if (y > 220) {
    doc.addPage();
    y = 20;
  } else {
    y += 15;
  }

  // Linha para assinatura
  doc.setLineWidth(0.5);
  doc.line(70, y, 140, y);
  y += 6;

  // Nome do profissional
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text(profissional.nome, 105, y, { align: "center" });
  y += 5;

  // Especialidade
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(profissional.especialidade || "Profissional", 105, y, { align: "center" });
  y += 5;

  // 🔧 CORRIGIDO: Registro profissional agora puxa corretamente
  if (profissional.registroProfissional) {
    doc.text(profissional.registroProfissional, 105, y, { align: "center" });
  } else if (profissional.numeroProfissional) {
    doc.text(profissional.numeroProfissional, 105, y, { align: "center" });
  }

  // Data de emissão do relatório
  y += 10;
  const dataEmissao = new Date().toLocaleDateString('pt-BR');
  doc.setFontSize(9);
  doc.setFont("helvetica", "italic");
  doc.text(`Relatório emitido em: ${dataEmissao}`, 105, y, { align: "center" });

  // ===== DOWNLOAD =====
  const dataFormatada = new Date().toISOString().split('T')[0];
  doc.save(`relatorio_${aluno.nome.replaceAll(" ", "_")}_${dataFormatada}.pdf`);
}
