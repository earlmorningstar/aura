// "use client";

// import { GlassCard } from "@/components/ui/glass-card";
// import { useState } from "react";

// interface Column<T> {
//   key: keyof T;
//   label: string;
//   render?: (value: T[keyof T]) => React.ReactNode;
// }

// export function DataTable<T extends { id: string }>({
//   data,
//   columns,
//   searchKey,
// }: {
//   data: T[];
//   columns: Column<T>[];
//   searchKey: keyof T;
// }) {
//   const [search, setSearch] = useState("");

//   const filtered = data.filter((row) =>
//     String(row[searchKey]).toLowerCase().includes(search.toLowerCase()),
//   );

//   return (
//     <GlassCard className="overflow-hidden">
//       <div className="p-4 border-b border-white/10">
//         <input
//           type="text"
//           placeholder="Search transactions..."
//           value={search}
//           onChange={(e) => setSearch(e.target.value)}
//           className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm placeholder:text-zinc-400 focus:outline-none"
//         />
//       </div>
//       <div className="overflow-x-auto">
//         <table className="w-full">
//           <thead>
//             <tr className="border-b border-white/10">
//               {columns.map((col) => (
//                 <th
//                   key={String(col.key)}
//                   className="text-left px-6 py-4 text-xs font-medium text-zinc-400"
//                 >
//                   {col.label}
//                 </th>
//               ))}
//             </tr>
//           </thead>
//           <tbody>
//             {filtered.map((row) => (
//               <tr
//                 key={row.id}
//                 className="border-b border-white/5 hover:bg-white/5"
//               >
//                 {columns.map((col) => (
//                   <td key={String(col.key)} className="px-6 py-4 text-sm">
//                     {col.render
//                       ? col.render(row[col.key])
//                       : String(row[col.key] ?? "")}{" "}
//                   </td>
//                 ))}
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </GlassCard>
//   );
// }



"use client";

/**
 * DataTable — fully generic sortable, searchable, paginated table.
 *
 * Features:
 * - Generic `T` with `id: string | number` constraint
 * - Column-level sort (click header → asc → desc → none)
 * - Client-side search with debounce
 * - Pagination with page size selector (10 / 25 / 50)
 * - Row count + results label
 * - Empty state and no-results state
 * - Framer Motion row entrance stagger
 * - Glass input using `.input` utility class
 * - All colours from design tokens — zero magic values
 */

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ArrowUpDown, ArrowUp, ArrowDown, ChevronLeft, ChevronRight, Table2 } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { GlassButton } from "@/components/ui/glass-button";
import { cn } from "@/lib/utils";

/* ─── Types ──────────────────────────────────────────────────────── */

export interface Column<T> {
  /** Key in the data object */
  key: keyof T & string;
  /** Header label */
  label: string;
  /** Custom cell renderer. Receives the raw cell value. */
  render?: (value: T[keyof T], row: T) => React.ReactNode;
  /** Whether this column is sortable. Default: true */
  sortable?: boolean;
  /** Tailwind width class applied to the th/td. e.g. "w-32" */
  width?: string;
  /** Text alignment. Default: left */
  align?: "left" | "center" | "right";
}

type SortDirection = "asc" | "desc" | "none";

interface SortState<T> {
  key: keyof T | null;
  direction: SortDirection;
}

export interface DataTableProps<T extends { id: string | number }> {
  data: T[];
  columns: Column<T>[];
  /** Key to search against */
  searchKey?: keyof T & string;
  /** Placeholder for the search input */
  searchPlaceholder?: string;
  /** Default rows per page */
  defaultPageSize?: number;
  /** Available page size options */
  pageSizeOptions?: number[];
  /** Optional caption for accessibility */
  caption?: string;
  className?: string;
}

/* ─── Sort icon ──────────────────────────────────────────────────── */

function SortIcon({ direction }: { direction: SortDirection }) {
  if (direction === "asc") {
    return <ArrowUp size={12} aria-hidden style={{ color: "var(--accent-cyan)" }} />;
  }
  if (direction === "desc") {
    return <ArrowDown size={12} aria-hidden style={{ color: "var(--accent-cyan)" }} />;
  }
  return (
    <ArrowUpDown
      size={12}
      aria-hidden
      style={{ color: "var(--text-muted)", opacity: 0.5 }}
    />
  );
}

/* ─── Empty / no-results states ─────────────────────────────────── */

function TableEmpty({ searching }: { searching: boolean }) {
  return (
    <motion.tr
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      <td colSpan={999}>
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-2xl"
            style={{
              background: "rgba(var(--glass-bg-rgb) / 0.06)",
              border: "1px solid rgba(var(--glass-border-rgb) / 0.08)",
              color: "var(--text-muted)",
            }}
          >
            <Table2 size={20} />
          </div>
          <div>
            <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
              {searching ? "No results found" : "No data yet"}
            </p>
            <p className="mt-0.5 text-xs" style={{ color: "var(--text-muted)" }}>
              {searching ? "Try adjusting your search terms." : "Data will appear here once available."}
            </p>
          </div>
        </div>
      </td>
    </motion.tr>
  );
}

/* ─── Pagination ─────────────────────────────────────────────────── */

interface PaginationProps {
  page: number;
  totalPages: number;
  pageSize: number;
  pageSizeOptions: number[];
  totalRows: number;
  filteredRows: number;
  onPage: (p: number) => void;
  onPageSize: (s: number) => void;
}

function Pagination({
  page,
  totalPages,
  pageSize,
  pageSizeOptions,
  totalRows,
  filteredRows,
  onPage,
  onPageSize,
}: PaginationProps) {
  const start = Math.min((page - 1) * pageSize + 1, filteredRows);
  const end   = Math.min(page * pageSize, filteredRows);

  return (
    <div
      className="flex flex-wrap items-center justify-between gap-3 px-5 py-3"
      style={{ borderTop: "1px solid rgba(var(--glass-border-rgb) / 0.08)" }}
    >
      {/* Row count label */}
      <p className="text-xs" style={{ color: "var(--text-muted)" }}>
        {filteredRows === 0
          ? "No results"
          : `${start}–${end} of ${filteredRows}${filteredRows < totalRows ? ` (filtered from ${totalRows})` : ""}`}
      </p>

      <div className="flex items-center gap-3">
        {/* Page size selector */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>Rows:</span>
          {pageSizeOptions.map((size) => (
            <motion.button
              key={size}
              className="rounded-lg px-2 py-1 text-xs font-medium"
              style={{
                background: pageSize === size
                  ? "rgba(var(--glass-bg-rgb) / 0.12)"
                  : "transparent",
                color: pageSize === size ? "var(--text-primary)" : "var(--text-tertiary)",
                border: pageSize === size
                  ? "1px solid rgba(var(--glass-border-rgb) / 0.12)"
                  : "1px solid transparent",
              }}
              onClick={() => onPageSize(size)}
              whileTap={{ scale: 0.9, transition: { type: "spring", stiffness: 600, damping: 28 } }}
            >
              {size}
            </motion.button>
          ))}
        </div>

        {/* Page navigation */}
        <div className="flex items-center gap-1">
          <GlassButton
            variant="icon"
            size="icon_sm"
            onClick={() => onPage(page - 1)}
            disabled={page <= 1}
            aria-label="Previous page"
          >
            <ChevronLeft size={14} />
          </GlassButton>

          {/* Page number pills — show at most 5 */}
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
            let pageNum: number;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (page <= 3) {
              pageNum = i + 1;
            } else if (page >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = page - 2 + i;
            }
            return (
              <motion.button
                key={pageNum}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-xs font-medium"
                style={{
                  background: pageNum === page
                    ? "rgba(var(--accent-cyan-rgb) / 0.15)"
                    : "transparent",
                  color: pageNum === page ? "var(--accent-cyan)" : "var(--text-tertiary)",
                  border: pageNum === page
                    ? "1px solid rgba(var(--accent-cyan-rgb) / 0.25)"
                    : "1px solid transparent",
                }}
                onClick={() => onPage(pageNum)}
                whileTap={{ scale: 0.9, transition: { type: "spring", stiffness: 600, damping: 28 } }}
                aria-label={`Page ${pageNum}`}
                aria-current={pageNum === page ? "page" : undefined}
              >
                {pageNum}
              </motion.button>
            );
          })}

          <GlassButton
            variant="icon"
            size="icon_sm"
            onClick={() => onPage(page + 1)}
            disabled={page >= totalPages}
            aria-label="Next page"
          >
            <ChevronRight size={14} />
          </GlassButton>
        </div>
      </div>
    </div>
  );
}

/* ─── DataTable ──────────────────────────────────────────────────── */

/**
 * DataTable<T>
 *
 * @example Revenue transactions
 * <DataTable
 *   data={transactions}
 *   columns={[
 *     { key: "date", label: "Date" },
 *     { key: "amount", label: "Amount", render: (v) => `$${v}` },
 *   ]}
 *   searchKey="description"
 * />
 */
export function DataTable<T extends { id: string | number }>({
  data,
  columns,
  searchKey,
  searchPlaceholder = "Search…",
  defaultPageSize = 10,
  pageSizeOptions = [10, 25, 50],
  caption,
  className,
}: DataTableProps<T>) {
  const [search, setSearch]       = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [sort, setSort]           = React.useState<SortState<T>>({ key: null, direction: "none" });
  const [page, setPage]           = React.useState(1);
  const [pageSize, setPageSize]   = React.useState(defaultPageSize);

  // Debounce search to avoid filtering on every keystroke
  React.useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset to page 1 on new search
    }, 200);
    return () => clearTimeout(t);
  }, [search]);

  // Reset page when sort changes
  React.useEffect(() => {
    setPage(1);
  }, [sort]);

  // Filter
  const filtered = React.useMemo(() => {
    if (!searchKey || !debouncedSearch.trim()) return data;
    const q = debouncedSearch.toLowerCase();
    return data.filter((row) =>
      String(row[searchKey] ?? "").toLowerCase().includes(q),
    );
  }, [data, searchKey, debouncedSearch]);

  // Sort
  const sorted = React.useMemo(() => {
    if (!sort.key || sort.direction === "none") return filtered;
    return [...filtered].sort((a, b) => {
      const aVal = a[sort.key!];
      const bVal = b[sort.key!];
      const aStr = String(aVal ?? "");
      const bStr = String(bVal ?? "");
      // Numeric sort if both parse as numbers
      const aNum = Number(aVal);
      const bNum = Number(bVal);
      if (!isNaN(aNum) && !isNaN(bNum)) {
        return sort.direction === "asc" ? aNum - bNum : bNum - aNum;
      }
      return sort.direction === "asc"
        ? aStr.localeCompare(bStr)
        : bStr.localeCompare(aStr);
    });
  }, [filtered, sort]);

  // Paginate
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const paginated  = sorted.slice((page - 1) * pageSize, page * pageSize);

  // Column sort toggle
  function handleSort(key: keyof T) {
    setSort((prev) => {
      if (prev.key !== key) return { key, direction: "asc" };
      if (prev.direction === "asc")  return { key, direction: "desc" };
      return { key: null, direction: "none" };
    });
  }

  const alignClass = {
    left:   "text-left",
    center: "text-center",
    right:  "text-right",
  } as const;

  return (
    <GlassCard
      visual="default"
      padding="none"
      className={cn("overflow-hidden", className)}
    >
      {/* ── Search bar ─────────────────────────────────────── */}
      {searchKey && (
        <div
          className="flex items-center gap-3 px-5 py-4"
          style={{ borderBottom: "1px solid rgba(var(--glass-border-rgb) / 0.08)" }}
        >
          <Search
            size={15}
            aria-hidden
            style={{ color: "var(--text-muted)", flexShrink: 0 }}
          />
          <input
            type="search"
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-[color:var(--text-muted)]"
            style={{ color: "var(--text-primary)", fontFamily: "var(--font-body)" }}
            aria-label={searchPlaceholder}
          />
          {search && (
            <motion.button
              className="text-xs"
              style={{ color: "var(--text-muted)" }}
              onClick={() => setSearch("")}
              whileTap={{ scale: 0.9 }}
              aria-label="Clear search"
            >
              ✕
            </motion.button>
          )}
        </div>
      )}

      {/* ── Table ──────────────────────────────────────────── */}
      <div className="overflow-x-auto">
        <table
          className="w-full border-collapse"
          role="grid"
          aria-label={caption ?? "Data table"}
          aria-rowcount={sorted.length}
        >
          {caption && (
            <caption className="sr-only">{caption}</caption>
          )}

          <thead>
            <tr style={{ borderBottom: "1px solid rgba(var(--glass-border-rgb) / 0.08)" }}>
              {columns.map((col) => {
                const isSorted = sort.key === col.key;
                const sortable = col.sortable !== false;
                return (
                  <th
                    key={col.key}
                    className={cn(
                      "px-5 py-3",
                      col.width,
                      alignClass[col.align ?? "left"],
                    )}
                    aria-sort={
                      isSorted
                        ? sort.direction === "asc" ? "ascending" : "descending"
                        : sortable ? "none" : undefined
                    }
                  >
                    {sortable ? (
                      <motion.button
                        className="inline-flex items-center gap-1.5 rounded-md px-1 py-0.5 text-left"
                        style={{
                          fontSize: "var(--text-xs)",
                          fontWeight: 500,
                          letterSpacing: "var(--tracking-caps)",
                          textTransform: "uppercase",
                          color: isSorted ? "var(--text-primary)" : "var(--text-tertiary)",
                          fontFamily: "var(--font-body)",
                        }}
                        onClick={() => handleSort(col.key as keyof T)}
                        whileTap={{ scale: 0.97, transition: { type: "spring", stiffness: 600, damping: 28 } }}
                      >
                        {col.label}
                        <SortIcon direction={isSorted ? sort.direction : "none"} />
                      </motion.button>
                    ) : (
                      <span
                        style={{
                          fontSize: "var(--text-xs)",
                          fontWeight: 500,
                          letterSpacing: "var(--tracking-caps)",
                          textTransform: "uppercase",
                          color: "var(--text-tertiary)",
                        }}
                      >
                        {col.label}
                      </span>
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody>
            <AnimatePresence mode="wait">
              {paginated.length === 0 ? (
                <TableEmpty searching={debouncedSearch.trim().length > 0} />
              ) : (
                paginated.map((row, rowIndex) => (
                  <motion.tr
                    key={String(row.id)}
                    className="group"
                    style={{ borderBottom: "1px solid rgba(var(--glass-border-rgb) / 0.05)" }}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{
                      type: "spring",
                      stiffness: 320,
                      damping: 28,
                      delay: rowIndex * 0.03,
                    }}
                    whileHover={{
                      backgroundColor: "rgba(var(--glass-bg-rgb), 0.05)",
                      transition: { duration: 0.1 },
                    }}
                    aria-rowindex={((page - 1) * pageSize) + rowIndex + 2}
                  >
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={cn(
                          "px-5 py-3.5 text-sm",
                          col.width,
                          alignClass[col.align ?? "left"],
                        )}
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {col.render
                          ? col.render(row[col.key as keyof T], row)
                          : String(row[col.key as keyof T] ?? "")}
                      </td>
                    ))}
                  </motion.tr>
                ))
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* ── Pagination ─────────────────────────────────────── */}
      {sorted.length > 0 && (
        <Pagination
          page={page}
          totalPages={totalPages}
          pageSize={pageSize}
          pageSizeOptions={pageSizeOptions}
          totalRows={data.length}
          filteredRows={sorted.length}
          onPage={(p) => setPage(Math.max(1, Math.min(p, totalPages)))}
          onPageSize={(s) => { setPageSize(s); setPage(1); }}
        />
      )}
    </GlassCard>
  );
}