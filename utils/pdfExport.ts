/**
 * PDF Export Utility for AI RISK MANAGER
 *
 * Generates HTML-based exports that can be printed to PDF or saved as HTML files.
 * Used to export filtered data from COMPASS navigation.
 */

export interface PDFExportData {
  title: string;
  sourceUseCase?: string;
  items: Array<{
    id: string;
    [key: string]: any;
  }>;
  columns: Array<{
    key: string;
    label: string;
    format?: (value: any) => string; // Optional formatter for cell content
  }>;
}

/**
 * Formats a value for display in the export
 */
const formatValue = (value: any): string => {
  if (value === null || value === undefined) return '';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
};

/**
 * Escapes HTML special characters
 */
const escapeHtml = (text: string): string => {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
};

/**
 * Exports data to an HTML file (can be printed to PDF or saved)
 *
 * @param data - Export configuration with title, items, columns, and optional source use case
 */
export const exportToPDF = (data: PDFExportData): void => {
  // Generate HTML content for PDF/export
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(data.title)}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      padding: 20px;
      color: #1a1a2e;
      background: white;
    }
    h1 {
      color: #00d4ff;
      border-bottom: 3px solid #00d4ff;
      padding-bottom: 10px;
      margin-bottom: 10px;
    }
    h2 {
      color: #333;
      margin-top: 5px;
      margin-bottom: 20px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;
      page-break-inside: auto;
    }
    tr {
      page-break-inside: avoid;
      page-break-after: auto;
    }
    th {
      background: #1a1a2e;
      color: #00d4ff;
      padding: 12px 10px;
      text-align: left;
      font-weight: bold;
      border: 1px solid #333;
      font-size: 11px;
      text-transform: uppercase;
    }
    td {
      border: 1px solid #ddd;
      padding: 10px;
      vertical-align: top;
      font-size: 11px;
      line-height: 1.4;
    }
    tr:nth-child(even) {
      background: #f9f9f9;
    }
    tr:nth-child(odd) {
      background: white;
    }
    .meta {
      color: #666;
      font-size: 12px;
      margin: 10px 0;
      padding: 10px;
      background: #f5f5f5;
      border-left: 4px solid #00d4ff;
    }
    .footer {
      margin-top: 30px;
      padding-top: 15px;
      border-top: 2px solid #ddd;
      font-size: 10px;
      color: #999;
      text-align: center;
    }
    a {
      color: #00d4ff;
      text-decoration: none;
    }
    a:hover {
      text-decoration: underline;
    }
    @media print {
      body {
        padding: 10px;
      }
      .meta {
        break-inside: avoid;
      }
      thead {
        display: table-header-group;
      }
    }
  </style>
</head>
<body>
  <h1>AI RISK MANAGER - ${escapeHtml(data.title)}</h1>
  ${data.sourceUseCase ? `<h2>Cas d'usage: ${escapeHtml(data.sourceUseCase)}</h2>` : ''}
  <div class="meta">
    <strong>Généré le:</strong> ${new Date().toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })} |
    <strong>Nombre d'éléments:</strong> ${data.items.length}
  </div>
  <table>
    <thead>
      <tr>${data.columns.map(col => `<th>${escapeHtml(col.label)}</th>`).join('')}</tr>
    </thead>
    <tbody>
      ${data.items.map(item => `
        <tr>${data.columns.map(col => {
          const value = item[col.key];
          const formatted = col.format ? col.format(value) : formatValue(value);
          return `<td>${escapeHtml(formatted)}</td>`;
        }).join('')}</tr>
      `).join('')}
    </tbody>
  </table>
  <div class="footer">
    Généré par AI RISK MANAGER - OWASP COMPASS Navigation Export<br>
    © 2025 - Basé sur OWASP LLM Top 10, OWASP Agentic AI Top 15, OWASP GenAI COMPASS (CC BY-SA 4.0)
  </div>
</body>
</html>
  `;

  // Create blob and download
  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;

  // Generate filename from title and timestamp
  const timestamp = new Date().toISOString().slice(0, 10);
  const sanitizedTitle = data.title.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_-]/g, '');
  link.download = `${sanitizedTitle}_${timestamp}.html`;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Opens a print dialog with the exported content
 * Useful for direct PDF printing via browser
 */
export const printToPDF = (data: PDFExportData): void => {
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(data.title)}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      padding: 20px;
      color: #1a1a2e;
    }
    h1 {
      color: #00d4ff;
      border-bottom: 3px solid #00d4ff;
      padding-bottom: 10px;
    }
    h2 {
      color: #333;
      margin-top: 5px;
      margin-bottom: 20px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;
    }
    th {
      background: #1a1a2e;
      color: #00d4ff;
      padding: 10px;
      text-align: left;
    }
    td {
      border: 1px solid #ddd;
      padding: 8px;
      font-size: 11px;
    }
    tr:nth-child(even) {
      background: #f2f2f2;
    }
    .meta {
      color: #666;
      font-size: 12px;
      margin: 10px 0;
    }
  </style>
</head>
<body>
  <h1>AI RISK MANAGER - ${escapeHtml(data.title)}</h1>
  ${data.sourceUseCase ? `<h2>Cas d'usage: ${escapeHtml(data.sourceUseCase)}</h2>` : ''}
  <div class="meta">Généré le ${new Date().toLocaleDateString('fr-FR')} - ${data.items.length} éléments</div>
  <table>
    <thead>
      <tr>${data.columns.map(col => `<th>${escapeHtml(col.label)}</th>`).join('')}</tr>
    </thead>
    <tbody>
      ${data.items.map(item => `
        <tr>${data.columns.map(col => {
          const value = item[col.key];
          const formatted = col.format ? col.format(value) : formatValue(value);
          return `<td>${escapeHtml(formatted)}</td>`;
        }).join('')}</tr>
      `).join('')}
    </tbody>
  </table>
</body>
</html>
  `;

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  }
};
