export interface ExportData {
  projects?: any[];
  analytics?: any;
  infrastructure?: any[];
  summary?: any;
}

export interface ExportOptions {
  format: 'csv' | 'json' | 'pdf';
  filename?: string;
  includeCharts?: boolean;
}

export const exportToCSV = (data: any[], filename: string = 'export.csv') => {
  if (!data || data.length === 0) {
    throw new Error('No data to export');
  }

  // Get all unique keys from all objects
  const allKeys = Array.from(
    new Set(data.flatMap(item => Object.keys(flattenObject(item))))
  );

  // Create CSV header
  const csvHeader = allKeys.join(',');

  // Create CSV rows
  const csvRows = data.map(item => {
    const flatItem = flattenObject(item);
    return allKeys.map(key => {
      const value = flatItem[key];
      // Handle values that might contain commas or quotes
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value || '';
    }).join(',');
  });

  const csvContent = [csvHeader, ...csvRows].join('\n');
  downloadFile(csvContent, filename, 'text/csv');
};

export const exportToJSON = (data: any, filename: string = 'export.json') => {
  const jsonContent = JSON.stringify(data, null, 2);
  downloadFile(jsonContent, filename, 'application/json');
};

export const exportAnalyticsReport = async (
  data: ExportData,
  options: ExportOptions = { format: 'csv' }
) => {
  const timestamp = new Date().toISOString().split('T')[0];
  const defaultFilename = `analytics-report-${timestamp}`;
  const filename = options.filename || defaultFilename;

  switch (options.format) {
    case 'csv':
      if (data.projects && data.projects.length > 0) {
        exportToCSV(data.projects, `${filename}-projects.csv`);
      }
      if (data.infrastructure && data.infrastructure.length > 0) {
        exportToCSV(data.infrastructure, `${filename}-infrastructure.csv`);
      }
      if (data.summary) {
        exportToJSON(data.summary, `${filename}-summary.json`);
      }
      break;

    case 'json':
      exportToJSON(data, `${filename}.json`);
      break;

    case 'pdf':
      await exportToPDF(data, `${filename}.pdf`, options.includeCharts);
      break;

    default:
      throw new Error(`Unsupported export format: ${options.format}`);
  }
};

const exportToPDF = async (data: ExportData, filename: string, includeCharts: boolean = false) => {
  // This would require a PDF library like jsPDF
  // For now, we'll create a simple HTML report and let the user print to PDF
  const htmlContent = generateHTMLReport(data, includeCharts);
  
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    
    // Trigger print dialog after content loads
    printWindow.onload = () => {
      printWindow.print();
    };
  }
};

const generateHTMLReport = (data: ExportData, includeCharts: boolean): string => {
  const timestamp = new Date().toLocaleString();
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Analytics Report</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { border-bottom: 2px solid #10b981; padding-bottom: 10px; margin-bottom: 20px; }
        .section { margin-bottom: 30px; }
        .section h2 { color: #10b981; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { border: 1px solid #e5e7eb; padding: 8px; text-align: left; }
        th { background-color: #f3f4f6; font-weight: bold; }
        .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; }
        .summary-card { border: 1px solid #e5e7eb; padding: 15px; border-radius: 8px; }
        .summary-card h3 { margin: 0 0 10px 0; color: #374151; }
        .summary-card .value { font-size: 24px; font-weight: bold; color: #10b981; }
        @media print { body { margin: 0; } }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>GreenH2-Nexus Analytics Report</h1>
        <p>Generated on: ${timestamp}</p>
      </div>

      ${data.summary ? `
        <div class="section">
          <h2>Executive Summary</h2>
          <div class="summary-grid">
            ${Object.entries(data.summary).map(([key, value]) => `
              <div class="summary-card">
                <h3>${formatKey(key)}</h3>
                <div class="value">${value}</div>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      ${data.projects && data.projects.length > 0 ? `
        <div class="section">
          <h2>Projects Overview</h2>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Status</th>
                <th>Capacity</th>
                <th>Location</th>
              </tr>
            </thead>
            <tbody>
              ${data.projects.map(project => `
                <tr>
                  <td>${project.name || 'N/A'}</td>
                  <td>${project.projectType || project.type || 'N/A'}</td>
                  <td>${project.status || 'N/A'}</td>
                  <td>${project.capacityTPA || project.capacity || 'N/A'}</td>
                  <td>${project.location?.region || 'N/A'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      ` : ''}

      ${data.infrastructure && data.infrastructure.length > 0 ? `
        <div class="section">
          <h2>Infrastructure Assets</h2>
          <table>
            <thead>
              <tr>
                <th>Type</th>
                <th>Status</th>
                <th>Capacity</th>
                <th>Location</th>
              </tr>
            </thead>
            <tbody>
              ${data.infrastructure.map(infra => `
                <tr>
                  <td>${infra.infrastructureType || infra.type || 'N/A'}</td>
                  <td>${infra.operationalStatus || infra.status || 'N/A'}</td>
                  <td>${infra.capacity?.value || infra.capacity || 'N/A'} ${infra.capacity?.unit || ''}</td>
                  <td>${infra.location?.region || 'N/A'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      ` : ''}

      <div class="section">
        <p><em>This report was generated by GreenH2-Nexus Analytics Platform</em></p>
      </div>
    </body>
    </html>
  `;
};

const flattenObject = (obj: any, prefix: string = ''): any => {
  const flattened: any = {};
  
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const newKey = prefix ? `${prefix}.${key}` : key;
      
      if (obj[key] !== null && typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
        Object.assign(flattened, flattenObject(obj[key], newKey));
      } else if (Array.isArray(obj[key])) {
        flattened[newKey] = obj[key].join('; ');
      } else {
        flattened[newKey] = obj[key];
      }
    }
  }
  
  return flattened;
};

const formatKey = (key: string): string => {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .replace(/_/g, ' ');
};

const downloadFile = (content: string, filename: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
};