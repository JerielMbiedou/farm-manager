export function stripAccents(s: string): string {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

export function matchesText(haystack: string, needle: string): boolean {
  if (!needle.trim()) return true;
  return stripAccents(haystack.toLowerCase()).includes(stripAccents(needle.toLowerCase().trim()));
}

function csvCell(v: unknown): string {
  if (v == null) return "";
  const s = String(v);
  if (/[",;\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function downloadCSV(filename: string, headers: string[], rows: (string | number | null | undefined)[][]): void {
  const sep = ";";
  const lines = [headers.map(csvCell).join(sep)];
  for (const row of rows) lines.push(row.map(csvCell).join(sep));
  const csv = "\uFEFF" + lines.join("\r\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function safeFilenameSlug(s: string): string {
  return stripAccents(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "export";
}
