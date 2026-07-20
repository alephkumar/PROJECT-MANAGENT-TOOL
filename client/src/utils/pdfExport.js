import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Generates and downloads a PDF report.
 * @param {string} title - Report title shown at the top of the PDF
 * @param {string[]} columns - Table column headers
 * @param {Array<Array<string|number>>} rows - Table row data
 * @param {string} filename - Download filename (without extension)
 */
export const exportReportToPDF = (title, columns, rows, filename) => {
  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.setTextColor(79, 70, 229);
  doc.text(title, 14, 18);

  doc.setFontSize(9);
  doc.setTextColor(100);
  doc.text(`Generated on ${new Date().toLocaleString('en-IN')}`, 14, 25);

  autoTable(doc, {
    head: [columns],
    body: rows,
    startY: 32,
    headStyles: { fillColor: [79, 70, 229] },
    styles: { fontSize: 8, cellPadding: 3 },
    alternateRowStyles: { fillColor: [245, 246, 250] },
  });

  doc.save(`${filename}.pdf`);
};
