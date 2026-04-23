import jsPDF from 'jspdf';
import { formatDate, formatDateTime } from './helpers';
import { MACHINE_STATUS_LABELS, SERVICE_ENTRY_TYPE_LABELS } from './constants';

export function generateWithdrawalTerm(withdrawal) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = 20;

  const safeText = (v) => (v != null && v !== '' ? String(v) : '-');
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
  doc.setFillColor(30, 136, 229); // blue-700
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
    `Emitido em: ${formatDate(withdrawal.createdAt, 'dd/MM/yyyy HH:mm')}`,
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
    ['Data de retirada:', formatDate(withdrawal.withdrawalDate + 'T00:00:00', 'dd/MM/yyyy')],
    ['Previsão de devolução:', formatDate(withdrawal.expectedReturn + 'T00:00:00', 'dd/MM/yyyy')],
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

  // Cabeçalho da tabela
  doc.setFillColor(243, 244, 246);
  doc.rect(margin, y - 5, contentWidth, rowHeight, 'F');
  doc.setDrawColor(209, 213, 219);
  doc.rect(margin, y - 5, contentWidth, rowHeight, 'S');

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(55, 65, 81);
  headers.forEach((h, i) => doc.text(h, colX[i] + 2, y));
  y += rowHeight;

  // Linhas da tabela
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
    // Estado na saída e entrada ficam em branco para preenchimento manual
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
    `${formatDate(withdrawal.expectedReturn + 'T00:00:00', 'dd/MM/yyyy')}, nas mesmas condições ` +
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

export function generateCompletionReport(machine, completionData) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let y = 20;

  const safeText = (v) => (v != null ? String(v) : '-');

  // ─── CABEÇALHO ────────────────────────────────────────────
  doc.setFillColor(5, 150, 105); // emerald-600
  doc.rect(0, 0, pageWidth, 55, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('RELATÓRIO DE FINALIZAÇÃO', margin, 26);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('ServiceLab — Gerenciamento de Laboratório', margin, 37);

  const emittedAt = completionData?.completedAt ?? new Date().toISOString();
  doc.text(`Emitido em: ${formatDateTime(emittedAt)}`, margin, 47);

  y = 68;

  // ─── DADOS DA MÁQUINA ─────────────────────────────────────
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
    ['Data de Entrada:', formatDate(machine.entryDate)],
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

  // ─── PROBLEMA IDENTIFICADO ────────────────────────────────
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

  // ─── PROCEDIMENTOS REALIZADOS ─────────────────────────────
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
        `${SERVICE_ENTRY_TYPE_LABELS[entry.type] ?? 'Ação'} — ${formatDateTime(entry.timestamp)}`,
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

  // ─── PEÇAS SUBSTITUÍDAS ───────────────────────────────────
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

  // ─── OBSERVAÇÕES FINAIS ───────────────────────────────────
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

  // ─── REGISTRO FOTOGRÁFICO ─────────────────────────────────
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

  // ─── ASSINATURA ───────────────────────────────────────────
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

  // ─── RODAPÉ ───────────────────────────────────────────────
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

  const dateStr = formatDate(emittedAt).replace(/\//g, '-');
  const serial = machine.serialNumber ?? machine.id ?? 'maquina';
  doc.save(`relatorio_maquina_${serial}_${dateStr}.pdf`);
}

export function generateServiceReport(machine, parts) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let y = 20;

  // Header
  doc.setFillColor(37, 99, 235); // Primary blue
  doc.rect(0, 0, pageWidth, 50, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('Service Report', margin, 30);
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated on ${formatDate(new Date().toISOString())}`, margin, 42);

  y = 65;

  // Machine Information Section
  doc.setTextColor(31, 41, 55);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Machine Information', margin, y);
  
  y += 10;
  doc.setDrawColor(229, 231, 235);
  doc.line(margin, y, pageWidth - margin, y);
  y += 8;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  
  const machineInfo = [
    ['Brand & Model:', `${machine.brand} ${machine.model}`],
    ['Serial Number:', machine.serialNumber],
    ['Status:', MACHINE_STATUS_LABELS[machine.status] || machine.status],
    ['Entry Date:', formatDate(machine.entryDate)],
    ['Location:', `${machine.location}${machine.locationDetail ? ` - ${machine.locationDetail}` : ''}`],
  ];

  machineInfo.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');
    doc.text(label, margin, y);
    doc.setFont('helvetica', 'normal');
    doc.text(value, margin + 40, y);
    y += 7;
  });

  if (machine.isUrgent) {
    y += 5;
    doc.setFillColor(254, 226, 226);
    doc.roundedRect(margin, y - 5, pageWidth - margin * 2, 12, 3, 3, 'F');
    doc.setTextColor(185, 28, 28);
    doc.setFont('helvetica', 'bold');
    doc.text('⚠ URGENT: This machine requires immediate attention', margin + 5, y + 3);
    doc.setTextColor(31, 41, 55);
    y += 15;
  } else {
    y += 10;
  }

  // Problem Description
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Problem Description', margin, y);
  
  y += 10;
  doc.line(margin, y, pageWidth - margin, y);
  y += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  const problemLines = doc.splitTextToSize(machine.problemDescription, pageWidth - margin * 2);
  doc.text(problemLines, margin, y);
  y += problemLines.length * 5 + 10;

  // Service History
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Service History', margin, y);
  
  y += 10;
  doc.line(margin, y, pageWidth - margin, y);
  y += 8;

  if (machine.serviceLog && machine.serviceLog.length > 0) {
    machine.serviceLog.forEach((entry, index) => {
      // Check if we need a new page
      if (y > 250) {
        doc.addPage();
        y = 20;
      }

      // Entry header
      doc.setFillColor(243, 244, 246);
      doc.roundedRect(margin, y - 5, pageWidth - margin * 2, 10, 2, 2, 'F');
      
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(55, 65, 81);
      doc.text(
        `${SERVICE_ENTRY_TYPE_LABELS[entry.type] || 'Update'} - ${formatDateTime(entry.timestamp)}`,
        margin + 5,
        y
      );
      
      y += 12;

      // Entry description
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(31, 41, 55);
      
      const descLines = doc.splitTextToSize(entry.description, pageWidth - margin * 2 - 10);
      doc.text(descLines, margin + 5, y);
      y += descLines.length * 5 + 3;

      // Parts used
      if (entry.partsUsed && entry.partsUsed.length > 0) {
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text('Parts Used:', margin + 5, y);
        y += 5;
        
        doc.setFont('helvetica', 'normal');
        entry.partsUsed.forEach(part => {
          doc.text(`• ${part.name} (x${part.quantity})`, margin + 10, y);
          y += 4;
        });
        y += 3;
      }

      y += 8;
    });
  } else {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.text('No service history recorded.', margin, y);
    y += 10;
  }

  // Parts Associated
  const associatedParts = parts.filter(p => p.machineId === machine.id);
  if (associatedParts.length > 0) {
    // Check if we need a new page
    if (y > 220) {
      doc.addPage();
      y = 20;
    }

    y += 10;
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Associated Parts', margin, y);
    
    y += 10;
    doc.line(margin, y, pageWidth - margin, y);
    y += 8;

    associatedParts.forEach((part, index) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`${index + 1}. ${part.name}`, margin, y);
      doc.text(`Qty: ${part.quantity}`, margin + 100, y);
      doc.text(`Status: ${part.status}`, margin + 130, y);
      y += 7;
    });
  }

  // Footer
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(156, 163, 175);
    doc.text(
      `Page ${i} of ${totalPages} - Printer Lab Manager`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  // Save the PDF
  const fileName = `service-report-${machine.serialNumber}-${formatDate(new Date().toISOString()).replace(/\//g, '-')}.pdf`;
  doc.save(fileName);
}
