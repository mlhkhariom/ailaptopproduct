// Simple Excel-compatible CSV export with BOM for proper Hindi/UTF-8 support
// No external dependency needed

export function exportToCSV(data: Record<string, any>[], filename: string) {
  if (!data.length) return;
  const headers = Object.keys(data[0]);
  const rows = data.map(row => headers.map(h => {
    const val = row[h] ?? '';
    return `"${String(val).replace(/"/g, '""')}"`;
  }).join(','));
  const csv = '\uFEFF' + [headers.join(','), ...rows].join('\n'); // BOM for Excel
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

// Export multiple sheets as separate CSV files zipped — or just one sheet
export function exportReportData(title: string, sections: { name: string; data: Record<string, any>[] }[]) {
  sections.forEach(s => {
    if (s.data.length) exportToCSV(s.data, `${title}_${s.name}.csv`);
  });
}
