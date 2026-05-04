import jsPDF from 'jspdf';
import { MACHINE_STATUS_LABELS, SERVICE_ENTRY_TYPE_LABELS } from './constants';

// ── Utilitários internos ──────────────────────────────────────────────────────

const formatPtDate = (dateString) => {
  if (!dateString) return '-';
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString('pt-BR');
  } catch {
    return '-';
  }
};

const formatPtDateTime = (dateString) => {
  if (!dateString) return '-';
  try {
    const d = new Date(dateString);
    return d.toLocaleString('pt-BR');
  } catch {
    return '-';
  }
};

const safeText = (v) => (v != null && v !== '' ? String(v) : '-');

// Converte URL de imagem para base64 (suporta URLs remotas e data URIs)
async function urlToBase64(url) {
  if (!url) return null;
  if (url.startsWith('data:')) return url;
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

// ── Termo de Retirada ─────────────────────────────────────────────────────────

export function generateWithdrawalTerm(withdrawal) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = 20;

  const line = (yPos) => {
    doc.setDrawColor(209, 213, 219);
    doc.line(margin, yPos, pageWidth - margin, yPos);
  };
  const sectionTitle = (title, yPos) => {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(31, 41, 55);
    doc.text(title, margin, yPos);
    yPos += 5;
    line(yPos);
    return yPos + 7;
  };

  // ─── CABEÇALHO ────────────────────────────────────────────────
  doc.setFillColor(30, 136, 229);
  doc.rect(0, 0, pageWidth, 58, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('ServiceLab — Laboratório de Manutenção', margin, 18);

  doc.setFontSize(17);
  doc.setFont('helvetica', 'bold');
  doc.text('TERMO DE RETIRADA DE FERRAMENTAS', margin, 30);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Protocolo: ${withdrawal.protocol}`, margin, 41);
  doc.text(
    `Emitido em: ${formatPtDateTime(withdrawal.createdAt)}`,
    margin,
    50
  );

  y = 72;

  // ─── DADOS DO TÉCNICO ─────────────────────────────────────────
  y = sectionTitle('Dados do Técnico', y);

  const techRows = [
    ['Nome completo:', safeText(withdrawal.technicianName)],
    ['Empresa / Contratada:', safeText(withdrawal.company)],
    ['CPF / Identificação:', safeText(withdrawal.cpf)],
  ];

  doc.setFontSize(10);
  techRows.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');
    doc.text(label, margin, y);
    doc.setFont('helvetica', 'normal');
    doc.text(value, margin + 52, y);
    y += 7;
  });

  y += 6;

  // ─── PERÍODO DE USO ───────────────────────────────────────────
  y = sectionTitle('Período de Uso', y);

  const periodRows = [
    ['Data de retirada:', formatPtDate(withdrawal.withdrawalDate + 'T00:00:00')],
    ['Previsão de devolução:', formatPtDate(withdrawal.expectedReturn + 'T00:00:00')],
    ['Data de devolução efetiva:', '______________________________'],
  ];

  doc.setFontSize(10);
  periodRows.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');
    doc.text(label, margin, y);
    doc.setFont('helvetica', 'normal');
    doc.text(value, margin + 52, y);
    y += 7;
  });

  if (withdrawal.purpose) {
    doc.setFont('helvetica', 'bold');
    doc.text('Finalidade / Local de uso:', margin, y);
    doc.setFont('helvetica', 'normal');
    const purposeLines = doc.splitTextToSize(withdrawal.purpose, contentWidth - 52);
    doc.text(purposeLines, margin + 52, y);
    y += purposeLines.length * 6;
  }

  y += 6;

  // ─── TABELA DE FERRAMENTAS ────────────────────────────────────
  if (y > 220) { doc.addPage(); y = 20; }
  y = sectionTitle('Ferramentas Retiradas', y);

  const colWidths = [10, 80, 42, 38];
  const colX = [margin, margin + 12, margin + 94, margin + 138];
  const headers = ['#', 'Descrição', 'Estado na Saída', 'Estado na Entrada'];
  const rowHeight = 8;

  doc.setFillColor(243, 244, 246);
  doc.rect(margin, y - 5, contentWidth, rowHeight, 'F');
  doc.setDrawColor(209, 213, 219);
  doc.rect(margin, y - 5, contentWidth, rowHeight, 'S');

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(55, 65, 81);
  headers.forEach((h, i) => doc.text(h, colX[i] + 2, y));
  y += rowHeight;

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(31, 41, 55);
  (withdrawal.tools || []).forEach((tool, idx) => {
    if (y > 265) { doc.addPage(); y = 20; }
    doc.setDrawColor(209, 213, 219);
    doc.rect(margin, y - 5, contentWidth, rowHeight, 'S');

    doc.setFontSize(9);
    doc.text(String(idx + 1), colX[0] + 2, y);
    const toolLines = doc.splitTextToSize(tool, colWidths[1] - 4);
    doc.text(toolLines[0], colX[1] + 2, y);
    y += Math.max(rowHeight, toolLines.length * 5);
  });

  y += 8;

  // ─── OBSERVAÇÕES ──────────────────────────────────────────────
  if (withdrawal.observations) {
    if (y > 240) { doc.addPage(); y = 20; }
    y = sectionTitle('Observações', y);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const obsLines = doc.splitTextToSize(withdrawal.observations, contentWidth);
    doc.text(obsLines, margin, y);
    y += obsLines.length * 6 + 8;
  }

  // ─── DECLARAÇÃO ───────────────────────────────────────────────
  if (y > 220) { doc.addPage(); y = 20; }
  y = sectionTitle('Declaração de Responsabilidade', y);

  const declaration =
    `Eu, ${safeText(withdrawal.technicianName)}, portador do CPF/ID ${safeText(withdrawal.cpf)}, ` +
    `representante da empresa ${safeText(withdrawal.company)}, declaro que recebi as ferramentas ` +
    `listadas acima em perfeito estado de conservação e me comprometo a devolvê-las até ` +
    `${formatPtDate(withdrawal.expectedReturn + 'T00:00:00')}, nas mesmas condições ` +
    `em que foram retiradas, responsabilizando-me por quaisquer danos, perdas ou extravios ocorridos ` +
    `durante o período de uso.`;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(31, 41, 55);
  const declarationLines = doc.splitTextToSize(declaration, contentWidth);
  doc.text(declarationLines, margin, y);
  y += declarationLines.length * 6 + 14;

  // ─── ASSINATURAS ──────────────────────────────────────────────
  if (y > 250) { doc.addPage(); y = 20; }

  const sigWidth = 75;
  const sig1X = margin;
  const sig2X = pageWidth - margin - sigWidth;

  doc.setDrawColor(107, 114, 128);
  doc.line(sig1X, y, sig1X + sigWidth, y);
  doc.line(sig2X, y, sig2X + sigWidth, y);

  y += 5;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(55, 65, 81);
  doc.text('Assinatura do Técnico', sig1X, y);
  doc.text('Responsável pelo Laboratório', sig2X, y);

  y += 5;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(107, 114, 128);
  doc.text(safeText(withdrawal.technicianName), sig1X, y);

  // ─── RODAPÉ ───────────────────────────────────────────────────
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(156, 163, 175);
    doc.text(
      `Página ${i} de ${totalPages} — ServiceLab | ${withdrawal.protocol}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  doc.save(`termo_retirada_${withdrawal.protocol}.pdf`);
}

// ── Relatório de Conclusão ────────────────────────────────────────────────────

export function generateCompletionReport(machine, completionData) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let y = 20;

  // ─── CABEÇALHO ────────────────────────────────────────────────
  doc.setFillColor(5, 150, 105);
  doc.rect(0, 0, pageWidth, 55, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('RELATÓRIO DE FINALIZAÇÃO', margin, 26);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('ServiceLab — Gerenciamento de Laboratório', margin, 37);

  const emittedAt = completionData?.completedAt ?? new Date().toISOString();
  doc.text(`Emitido em: ${formatPtDateTime(emittedAt)}`, margin, 47);

  y = 68;

  // ─── DADOS DA MÁQUINA ─────────────────────────────────────────
  doc.setTextColor(31, 41, 55);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('Dados da Máquina', margin, y);
  y += 7;
  doc.setDrawColor(209, 213, 219);
  doc.line(margin, y, pageWidth - margin, y);
  y += 8;

  const machineRows = [
    ['Máquina:', `${machine.brand} ${machine.model}`],
    ['Número de Série:', safeText(machine.serialNumber)],
    ['Patrimônio:', safeText(machine.patrimony)],
    ['Local:', safeText(machine.location)],
    ['Técnico Responsável:', safeText(completionData?.technician ?? machine.technician)],
    ['Data de Entrada:', formatPtDate(machine.entryDate)],
    ['Status Final:', 'Finalizada'],
  ];

  doc.setFontSize(10);
  machineRows.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');
    doc.text(label, margin, y);
    doc.setFont('helvetica', 'normal');
    doc.text(safeText(value), margin + 48, y);
    y += 7;
  });

  y += 6;

  // ─── PROBLEMA IDENTIFICADO ────────────────────────────────────
  if (machine.problemDescription) {
    if (y > 240) { doc.addPage(); y = 20; }

    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('Problema Identificado', margin, y);
    y += 7;
    doc.line(margin, y, pageWidth - margin, y);
    y += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const problemLines = doc.splitTextToSize(machine.problemDescription, pageWidth - margin * 2);
    doc.text(problemLines, margin, y);
    y += problemLines.length * 5 + 10;
  }

  // ─── PROCEDIMENTOS REALIZADOS ─────────────────────────────────
  const procedures = (machine.serviceLog ?? []).filter(
    e => e.type === 'action' || e.type === 'test'
  );

  if (procedures.length > 0) {
    if (y > 230) { doc.addPage(); y = 20; }

    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('Procedimentos Realizados', margin, y);
    y += 7;
    doc.line(margin, y, pageWidth - margin, y);
    y += 8;

    procedures.forEach((entry) => {
      if (y > 265) { doc.addPage(); y = 20; }

      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(75, 85, 99);
      doc.text(
        `${SERVICE_ENTRY_TYPE_LABELS[entry.type] ?? 'Ação'} — ${formatPtDateTime(entry.timestamp)}`,
        margin + 3,
        y
      );
      y += 6;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(31, 41, 55);
      const lines = doc.splitTextToSize(entry.description, pageWidth - margin * 2 - 6);
      doc.text(lines, margin + 3, y);
      y += lines.length * 5 + 5;
    });

    y += 4;
  }

  // ─── PEÇAS SUBSTITUÍDAS ───────────────────────────────────────
  const partsReplaced = (machine.serviceLog ?? []).filter(e => e.type === 'part_replaced');

  if (partsReplaced.length > 0) {
    if (y > 230) { doc.addPage(); y = 20; }

    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('Peças Substituídas', margin, y);
    y += 7;
    doc.line(margin, y, pageWidth - margin, y);
    y += 8;

    partsReplaced.forEach((entry, idx) => {
      if (y > 270) { doc.addPage(); y = 20; }
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const lines = doc.splitTextToSize(`${idx + 1}. ${entry.description}`, pageWidth - margin * 2);
      doc.text(lines, margin, y);
      y += lines.length * 5 + 3;
    });

    y += 6;
  }

  // ─── OBSERVAÇÕES FINAIS ───────────────────────────────────────
  if (completionData?.finalNotes) {
    if (y > 230) { doc.addPage(); y = 20; }

    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('Observações Finais', margin, y);
    y += 7;
    doc.line(margin, y, pageWidth - margin, y);
    y += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const notesLines = doc.splitTextToSize(completionData.finalNotes, pageWidth - margin * 2);
    doc.text(notesLines, margin, y);
    y += notesLines.length * 5 + 10;
  }

  // ─── REGISTRO FOTOGRÁFICO ─────────────────────────────────────
  if (completionData?.image) {
    if (y > 175) { doc.addPage(); y = 20; }

    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('Registro Fotográfico', margin, y);
    y += 7;
    doc.line(margin, y, pageWidth - margin, y);
    y += 8;

    const imgWidth = pageWidth - margin * 2;
    doc.addImage(completionData.image, 'JPEG', margin, y, imgWidth, 90);
    y += 100;
  }

  // ─── ASSINATURA ───────────────────────────────────────────────
  if (y > 240) { doc.addPage(); y = 20; }
  y += 12;
  doc.setDrawColor(156, 163, 175);
  doc.line(margin, y, margin + 75, y);
  y += 6;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(107, 114, 128);
  doc.text(safeText(completionData?.technician ?? machine.technician), margin, y);
  y += 4;
  doc.text('Técnico Responsável', margin, y);

  // ─── RODAPÉ ───────────────────────────────────────────────────
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(156, 163, 175);
    doc.text(
      `Página ${i} de ${totalPages} — ServiceLab`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  const dateStr = formatPtDate(emittedAt).replace(/\//g, '-');
  const serial = machine.serialNumber ?? machine.id ?? 'maquina';
  doc.save(`relatorio_maquina_${serial}_${dateStr}.pdf`);
}

// ── Relatório de Serviço (PT-BR) ──────────────────────────────────────────────

export function generateServiceReport(machine, parts) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let y = 20;

  // ─── CABEÇALHO ────────────────────────────────────────────────
  doc.setFillColor(37, 99, 235);
  doc.rect(0, 0, pageWidth, 50, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('RELATÓRIO DE SERVIÇO', margin, 28);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(`Gerado em: ${formatPtDateTime(new Date().toISOString())}`, margin, 42);

  y = 65;

  // ─── INFORMAÇÕES DA MÁQUINA ───────────────────────────────────
  doc.setTextColor(31, 41, 55);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Informações da Máquina', margin, y);

  y += 8;
  doc.setDrawColor(229, 231, 235);
  doc.line(margin, y, pageWidth - margin, y);
  y += 8;

  doc.setFontSize(10);
  const machineInfo = [
    ['Marca e Modelo:', `${machine.brand} ${machine.model}`],
    ['Número de Série:', safeText(machine.serialNumber)],
    ['Patrimônio:', safeText(machine.patrimony)],
    ['Status:', MACHINE_STATUS_LABELS[machine.status] || machine.status],
    ['Técnico Responsável:', safeText(machine.technician)],
    ['Data de Entrada:', formatPtDate(machine.entryDate)],
    ['Local:', safeText(machine.location)],
  ];

  machineInfo.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');
    doc.text(label, margin, y);
    doc.setFont('helvetica', 'normal');
    doc.text(safeText(value), margin + 45, y);
    y += 7;
  });

  if (machine.urgent) {
    y += 3;
    doc.setFillColor(254, 226, 226);
    doc.roundedRect(margin, y - 5, pageWidth - margin * 2, 12, 3, 3, 'F');
    doc.setTextColor(185, 28, 28);
    doc.setFont('helvetica', 'bold');
    doc.text('URGENTE: Esta máquina requer atenção imediata', margin + 5, y + 3);
    doc.setTextColor(31, 41, 55);
    y += 15;
  } else {
    y += 8;
  }

  // ─── DESCRIÇÃO DO PROBLEMA ────────────────────────────────────
  if (machine.problemDescription) {
    if (y > 240) { doc.addPage(); y = 20; }

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Descrição do Problema', margin, y);

    y += 8;
    doc.line(margin, y, pageWidth - margin, y);
    y += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const problemLines = doc.splitTextToSize(machine.problemDescription, pageWidth - margin * 2);
    doc.text(problemLines, margin, y);
    y += problemLines.length * 5 + 10;
  }

  // ─── HISTÓRICO DE SERVIÇOS ────────────────────────────────────
  if (y > 220) { doc.addPage(); y = 20; }

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Histórico de Serviços', margin, y);

  y += 8;
  doc.line(margin, y, pageWidth - margin, y);
  y += 8;

  if (machine.serviceLog && machine.serviceLog.length > 0) {
    machine.serviceLog.forEach((entry) => {
      if (y > 250) { doc.addPage(); y = 20; }

      doc.setFillColor(243, 244, 246);
      doc.roundedRect(margin, y - 5, pageWidth - margin * 2, 10, 2, 2, 'F');

      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(55, 65, 81);
      doc.text(
        `${SERVICE_ENTRY_TYPE_LABELS[entry.type] || 'Atualização'} — ${formatPtDateTime(entry.timestamp)}`,
        margin + 5,
        y
      );

      y += 12;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(31, 41, 55);

      const descLines = doc.splitTextToSize(entry.description, pageWidth - margin * 2 - 10);
      doc.text(descLines, margin + 5, y);
      y += descLines.length * 5 + 8;
    });
  } else {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(107, 114, 128);
    doc.text('Nenhum histórico de serviço registrado.', margin, y);
    y += 10;
  }

  // ─── PEÇAS ASSOCIADAS ─────────────────────────────────────────
  const associatedParts = parts.filter(p => p.machineId === machine.id);
  if (associatedParts.length > 0) {
    if (y > 220) { doc.addPage(); y = 20; }

    y += 8;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(31, 41, 55);
    doc.text('Peças Associadas', margin, y);

    y += 8;
    doc.line(margin, y, pageWidth - margin, y);
    y += 8;

    associatedParts.forEach((part, index) => {
      if (y > 270) { doc.addPage(); y = 20; }

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`${index + 1}. ${part.name}`, margin, y);
      doc.text(`Qtd: ${part.quantity}`, margin + 100, y);
      doc.text(`Status: ${part.status}`, margin + 130, y);
      y += 7;
    });
  }

  // ─── RODAPÉ ───────────────────────────────────────────────────
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(156, 163, 175);
    doc.text(
      `Página ${i} de ${totalPages} — ServiceLab`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  const fileName = `relatorio_servico_${machine.serialNumber}_${formatPtDate(new Date().toISOString()).replace(/\//g, '-')}.pdf`;
  doc.save(fileName);
}

// ── Relatório de Estoque ──────────────────────────────────────────────────────

export async function generateStockReport(machines) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  const now = new Date();
  let y = 20;

  const addFooter = () => {
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(156, 163, 175);
      doc.text(
        `Página ${i} de ${totalPages} — ServiceLab — Total: ${machines.length} máquina(s)`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
    }
  };

  // ─── CABEÇALHO ────────────────────────────────────────────────
  doc.setFillColor(5, 150, 105); // verde
  doc.rect(0, 0, pageWidth, 55, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('ServiceLab — Laboratório de Manutenção', margin, 18);

  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('RELATÓRIO DE ESTOQUE DE MÁQUINAS', margin, 32);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Gerado em: ${now.toLocaleString('pt-BR')}`, margin, 44);
  doc.text(
    `Total de máquinas: ${machines.length}`,
    pageWidth - margin,
    44,
    { align: 'right' }
  );

  y = 68;

  if (machines.length === 0) {
    doc.setTextColor(107, 114, 128);
    doc.setFontSize(12);
    doc.text('Nenhuma máquina em estoque no momento.', pageWidth / 2, y + 20, { align: 'center' });
    addFooter();
    doc.save(`relatorio_estoque_${now.toLocaleDateString('pt-BR').replace(/\//g, '-')}.pdf`);
    return;
  }

  // ─── CADA MÁQUINA ─────────────────────────────────────────────
  for (let idx = 0; idx < machines.length; idx++) {
    const machine = machines[idx];

    // Espaço necessário para o bloco (estimado)
    const needPhoto = machine.photos && machine.photos.length > 0;
    const blockHeight = needPhoto ? 70 : 50;

    if (y + blockHeight > 270) {
      doc.addPage();
      y = 20;
    }

    // ─ Fundo alternado
    if (idx % 2 === 0) {
      doc.setFillColor(249, 250, 251);
      doc.rect(margin - 3, y - 6, contentWidth + 6, blockHeight + 4, 'F');
    }

    // ─ Número do item
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(107, 114, 128);
    doc.text(`#${idx + 1}`, margin, y);

    // ─ Imagem (Base64 via fetch)
    let photoBase64 = null;
    if (needPhoto) {
      photoBase64 = await urlToBase64(machine.photos[0].url);
    }

    const hasPhoto = !!photoBase64;
    const photoW = 30;
    const photoH = 30;
    const photoX = margin;
    const textX = hasPhoto ? margin + photoW + 5 : margin;
    const textWidth = hasPhoto ? contentWidth - photoW - 5 : contentWidth;

    y += 6;

    if (hasPhoto) {
      try {
        // Placeholder cinza
        doc.setFillColor(229, 231, 235);
        doc.rect(photoX, y, photoW, photoH, 'F');
        doc.addImage(photoBase64, 'JPEG', photoX, y, photoW, photoH);
      } catch {
        // Se falhar, exibe placeholder
        doc.setFillColor(209, 213, 219);
        doc.rect(photoX, y, photoW, photoH, 'F');
        doc.setTextColor(156, 163, 175);
        doc.setFontSize(7);
        doc.text('Sem foto', photoX + photoW / 2, y + photoH / 2, { align: 'center' });
      }
    } else {
      // Placeholder quando não há foto
      doc.setFillColor(229, 231, 235);
      doc.rect(photoX, y, photoW, photoH, 'F');
      doc.setTextColor(156, 163, 175);
      doc.setFontSize(7);
      doc.text('Sem foto', photoX + photoW / 2, y + photoH / 2, { align: 'center' });
    }

    // ─ Dados da máquina
    const dataY = y;
    doc.setTextColor(31, 41, 55);

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`${machine.brand} ${machine.model}`, textX, dataY + 6);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(55, 65, 81);

    const rows = [
      [`Série: ${safeText(machine.serialNumber)}`, `Patrimônio: ${safeText(machine.patrimony)}`],
      [`Entrada: ${formatPtDate(machine.entryDate)}`, `Status: Pronta para Entrega`],
      [`Técnico: ${safeText(machine.technician)}`, `ID: #${machine.id}`],
    ];

    let rowY = dataY + 14;
    rows.forEach(([left, right]) => {
      doc.text(left, textX, rowY);
      if (right) doc.text(right, textX + textWidth / 2, rowY);
      rowY += 7;
    });

    // ─ Separador
    y = Math.max(y + photoH, rowY) + 6;
    doc.setDrawColor(229, 231, 235);
    doc.line(margin, y, pageWidth - margin, y);
    y += 6;
  }

  // ─── RESUMO FINAL ─────────────────────────────────────────────
  if (y > 250) { doc.addPage(); y = 20; }

  y += 4;
  doc.setFillColor(243, 244, 246);
  doc.rect(margin - 3, y - 4, contentWidth + 6, 18, 'F');

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(31, 41, 55);
  doc.text(
    `Total em estoque: ${machines.length} máquina(s)`,
    margin,
    y + 6
  );
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(107, 114, 128);
  doc.text(
    `Data/hora de geração: ${now.toLocaleString('pt-BR')}`,
    pageWidth - margin,
    y + 6,
    { align: 'right' }
  );

  addFooter();

  const fileName = `relatorio_estoque_${now.toLocaleDateString('pt-BR').replace(/\//g, '-')}.pdf`;
  doc.save(fileName);
}

// ── Relatório de Compras ──────────────────────────────────────────────────────

const PRIORITY_LABELS = { low: 'Baixa', medium: 'Média', high: 'Alta' };
const STATUS_LABELS    = { pending: 'Pendente', purchased: 'Comprado' };

export function generatePurchaseReport(purchases) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  const now = new Date();
  let y = 20;

  // ─── CABEÇALHO ────────────────────────────────────────────────
  doc.setFillColor(124, 58, 237); // roxo
  doc.rect(0, 0, pageWidth, 55, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('ServiceLab — Laboratório de Manutenção', margin, 18);

  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('LISTA DE COMPRAS - LABORATÓRIO', margin, 32);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Gerado em: ${now.toLocaleString('pt-BR')}`, margin, 44);
  doc.text(
    `Total de itens: ${purchases.length}`,
    pageWidth - margin,
    44,
    { align: 'right' }
  );

  y = 68;

  if (purchases.length === 0) {
    doc.setTextColor(107, 114, 128);
    doc.setFontSize(12);
    doc.text('Nenhum item de compra cadastrado.', pageWidth / 2, y + 20, { align: 'center' });
  } else {
    // ─── TABELA ───────────────────────────────────────────────────
    const colWidths = [72, 20, 28, 28, 22];
    const colX = [
      margin,
      margin + 72,
      margin + 92,
      margin + 120,
      margin + 148,
    ];
    const headers = ['Item', 'Qtd.', 'Prioridade', 'Status', 'Data'];
    const rowH = 9;

    // Cabeçalho da tabela
    doc.setFillColor(243, 244, 246);
    doc.rect(margin, y - 6, contentWidth, rowH + 2, 'F');
    doc.setDrawColor(209, 213, 219);
    doc.rect(margin, y - 6, contentWidth, rowH + 2, 'S');

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(55, 65, 81);
    headers.forEach((h, i) => doc.text(h, colX[i] + 2, y));
    y += rowH + 2;

    // Linhas
    purchases.forEach((item, idx) => {
      if (y > 270) { doc.addPage(); y = 20; }

      if (idx % 2 === 0) {
        doc.setFillColor(249, 250, 251);
        doc.rect(margin, y - 6, contentWidth, rowH + 1, 'F');
      }
      doc.setDrawColor(229, 231, 235);
      doc.rect(margin, y - 6, contentWidth, rowH + 1, 'S');

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(31, 41, 55);
      doc.setFontSize(9);

      const nameLines = doc.splitTextToSize(item.name, colWidths[0] - 4);
      doc.text(nameLines[0], colX[0] + 2, y);
      doc.text(String(item.quantity),                 colX[1] + 2, y);
      doc.text(PRIORITY_LABELS[item.priority] || '-', colX[2] + 2, y);
      doc.text(STATUS_LABELS[item.status]     || '-', colX[3] + 2, y);
      const dateStr = item.createdAt
        ? new Date(item.createdAt).toLocaleDateString('pt-BR')
        : '-';
      doc.text(dateStr, colX[4] + 2, y);

      if (item.description) {
        y += rowH;
        doc.setFontSize(8);
        doc.setTextColor(107, 114, 128);
        const descLines = doc.splitTextToSize(item.description, contentWidth - 8);
        doc.text(descLines[0], colX[0] + 4, y);
        doc.setTextColor(31, 41, 55);
      }

      y += rowH + 1;
    });

    // ─── RESUMO ───────────────────────────────────────────────────
    if (y > 250) { doc.addPage(); y = 20; }
    y += 6;

    const pending   = purchases.filter(p => p.status === 'pending').length;
    const purchased = purchases.filter(p => p.status === 'purchased').length;
    const highPrio  = purchases.filter(p => p.priority === 'high' && p.status === 'pending').length;

    doc.setFillColor(237, 233, 254);
    doc.rect(margin - 3, y - 4, contentWidth + 6, 26, 'F');

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(109, 40, 217);
    doc.text('Resumo', margin, y + 4);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(31, 41, 55);
    doc.setFontSize(9);
    doc.text(`Pendentes: ${pending}   |   Comprados: ${purchased}   |   Alta Prioridade Pendente: ${highPrio}`, margin, y + 14);
  }

  // ─── ASSINATURA ───────────────────────────────────────────────
  const pageH = doc.internal.pageSize.getHeight();
  const sigY = pageH - 35;
  doc.setDrawColor(156, 163, 175);
  doc.line(margin, sigY, margin + 75, sigY);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(107, 114, 128);
  doc.text('Assinatura do Responsável', margin, sigY + 5);
  doc.text(`Data: ${now.toLocaleDateString('pt-BR')}`, pageWidth - margin, sigY + 5, { align: 'right' });

  // ─── RODAPÉ ───────────────────────────────────────────────────
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(156, 163, 175);
    doc.text(
      `Página ${i} de ${totalPages} — ServiceLab`,
      pageWidth / 2,
      pageH - 10,
      { align: 'center' }
    );
  }

  const dateStr = now.toLocaleDateString('pt-BR').replace(/\//g, '-');
  doc.save(`lista_compras_${dateStr}.pdf`);
}
