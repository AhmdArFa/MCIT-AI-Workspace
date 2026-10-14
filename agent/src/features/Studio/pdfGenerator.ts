import jsPDF from 'jspdf';

export interface ReportSection {
  content: string;
  id: string;
  title: string;
}

export const exportToPdf = (
  reportTitle: string,
  summary: string,
  sections: ReportSection[],
) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let cursorY = margin;

  // Header Bar
  doc.setFillColor(15, 23, 42); // MCIT Slate
  doc.rect(0, 0, pageWidth, 16, 'F');

  doc.setFillColor(226, 184, 87); // Gold accent
  doc.rect(0, 16, pageWidth, 2, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('MINISTRY OF COMMUNICATIONS AND INFORMATION TECHNOLOGY', margin, 11);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('MCIT AI STUDIO', pageWidth - margin, 11, { align: 'right' });

  cursorY = 32;

  // Document Title
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  const splitTitle = doc.splitTextToSize(reportTitle || 'Official Executive Report', contentWidth);
  doc.text(splitTitle, margin, cursorY);
  cursorY += splitTitle.length * 9 + 4;

  // Meta line
  doc.setFontSize(10);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(100, 116, 139);
  doc.text(
    `Date: ${new Date().toLocaleDateString()} | Author: MCIT AI | Lead Developer: Eng Ahmed Arfa`,
    margin,
    cursorY,
  );
  cursorY += 10;

  // Horizontal separator
  doc.setDrawColor(203, 213, 225);
  doc.line(margin, cursorY, pageWidth - margin, cursorY);
  cursorY += 8;

  // Executive Summary Box
  if (summary) {
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);

    const summaryLines = doc.splitTextToSize(summary, contentWidth - 10);
    const boxHeight = summaryLines.length * 6 + 14;

    doc.roundedRect(margin, cursorY, contentWidth, boxHeight, 3, 3, 'FD');

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('Executive Summary', margin + 6, cursorY + 8);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);
    doc.text(summaryLines, margin + 6, cursorY + 16);

    cursorY += boxHeight + 10;
  }

  // Sections
  sections.forEach((sec, idx) => {
    // Check if we need a new page
    if (cursorY > pageHeight - 40) {
      doc.addPage();
      cursorY = margin + 10;
    }

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(`${idx + 1}. ${sec.title}`, margin, cursorY);
    cursorY += 7;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);
    const contentLines = doc.splitTextToSize(sec.content, contentWidth);

    contentLines.forEach((line: string) => {
      if (cursorY > pageHeight - 20) {
        doc.addPage();
        cursorY = margin + 10;
      }
      doc.text(line, margin, cursorY);
      cursorY += 6;
    });

    cursorY += 6;
  });

  // Footer on each page
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `MCIT AI Confidential &bull; Page ${i} of ${pageCount}`,
      pageWidth / 2,
      pageHeight - 8,
      { align: 'center' },
    );
  }

  const fileName = `${(reportTitle || 'MCIT_Report').replace(/[^a-z0-9_-]/gi, '_')}.pdf`;
  doc.save(fileName);
};
