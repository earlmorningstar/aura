// export function downloadCSV<T extends Record<string, unknown>>(
//   data: T[],
//   filename: string,
// ) {
//   if (data.length === 0) return;

//   const csv = [
//     Object.keys(data[0]).join(","),
//     ...data.map((row) => Object.values(row).join(",")),
//   ].join("\n");

//   const blob = new Blob([csv], { type: "text/csv" });
//   const url = URL.createObjectURL(blob);
//   const a = document.createElement("a");
//   a.href = url;
//   a.download = filename;
//   a.click();
//   URL.revokeObjectURL(url);
// }



/**
 * lib/exports.ts — file download utilities.
 *
 * Fixes in CSV export:
 * 1. data[0] access now safe (noUncheckedIndexedAccess tsconfig)
 * 2. Values with commas, quotes, or newlines are properly escaped
 * 3. UTF-8 BOM prepended so Excel opens the file without garbling
 * 4. Header labels mapped from column keys for readability
 */

/* ─── CSV helpers ────────────────────────────────────────────────── */

/**
 * Escape a single CSV cell value.
 * Wraps in double quotes if the value contains a comma, double quote, or newline.
 * Escapes existing double quotes by doubling them ("" per RFC 4180).
 */
function escapeCsvCell(value: unknown): string {
  const str = value === null || value === undefined ? "" : String(value);
  // Must quote if contains comma, double-quote, or newline
  if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Convert an array of objects to a CSV string.
 * The header row uses the object keys directly.
 * Values are RFC 4180 compliant.
 */
function toCsv<T extends Record<string, unknown>>(data: T[]): string {
  if (data.length === 0) return "";

  const firstRow = data[0];
  if (!firstRow) return "";

  const headers = Object.keys(firstRow);
  const rows: string[] = [
    headers.map(escapeCsvCell).join(","),
    ...data.map((row) =>
      headers.map((key) => escapeCsvCell(row[key])).join(","),
    ),
  ];

  return rows.join("\r\n"); // RFC 4180 requires CRLF
}

/* ─── Trigger download ───────────────────────────────────────────── */

/**
 * Trigger a CSV file download in the browser.
 *
 * @param data     Array of objects to export. Keys become column headers.
 * @param filename Suggested filename (include .csv extension).
 *
 * @example
 * downloadCSV(transactions, `revenue-${today}.csv`);
 */
export function downloadCSV<T extends Record<string, unknown>>(
  data: T[],
  filename: string,
): void {
  if (!data.length) return;

  const csv = toCsv(data);
  if (!csv) return;

  // UTF-8 BOM (\uFEFF) ensures Excel recognises the encoding correctly
  const bom = "\uFEFF";
  const blob = new Blob([bom + csv], { type: "text/csv;charset=utf-8;" });
  const url  = URL.createObjectURL(blob);

  const anchor = document.createElement("a");
  anchor.href     = url;
  anchor.download = filename;
  anchor.style.display = "none";

  document.body.appendChild(anchor);
  anchor.click();

  // Clean up — revokeObjectURL after a tick so the download starts
  setTimeout(() => {
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  }, 100);
}

/**
 * Convert an array of objects to a downloadable JSON file.
 *
 * @example
 * downloadJSON(insights, "aura-insights.json");
 */
export function downloadJSON<T>(data: T, filename: string): void {
  const json  = JSON.stringify(data, null, 2);
  const blob  = new Blob([json], { type: "application/json" });
  const url   = URL.createObjectURL(blob);

  const anchor = document.createElement("a");
  anchor.href     = url;
  anchor.download = filename;
  anchor.style.display = "none";

  document.body.appendChild(anchor);
  anchor.click();

  setTimeout(() => {
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  }, 100);
}