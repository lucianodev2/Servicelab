import jsPDF from 'jspdf';
import { formatDate, formatDateTime } from './helpers';
import { MACHINE_STATUS_LABELS, SERVICE_ENTRY_TYPE_LABELS } from './constants';

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
