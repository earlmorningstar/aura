"use client";

/**
 * RevenueTable — transaction history data table.
 *
 * - SkeletonTable loading state (not plain text)
 * - Empty state with icon + call-to-action copy
 * - Amount cells with colour coding (positive vs negative)
 * - Source badge chips using design token colours
 * - All magic colour values removed
 */

import * as React from "react";
import { motion } from "framer-motion";
import { ReceiptText, RefreshCw } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { SkeletonTable } from "@/components/ui/loading-skeleton";
import { useRevenue } from "@/hooks/use-revenue";
import { cn } from "@/lib/utils";

/* ─── Source badge ───────────────────────────────────────────────── */

const SOURCE_STYLES: Record<string, { bg: string; border: string; color: string }> = {
  Stripe: {
    bg:     "rgba(var(--accent-cyan-rgb) / 0.08)",
    border: "rgba(var(--accent-cyan-rgb) / 0.18)",
    color:  "var(--accent-cyan)",
  },
  Gumroad: {
    bg:     "rgba(var(--accent-purple-rgb) / 0.08)",
    border: "rgba(var(--accent-purple-rgb) / 0.18)",
    color:  "var(--accent-purple)",
  },
  Affiliate: {
    bg:     "rgba(var(--status-success-rgb) / 0.08)",
    border: "rgba(var(--status-success-rgb) / 0.18)",
    color:  "var(--status-success)",
  },
};

const DEFAULT_SOURCE_STYLE = {
  bg:     "rgba(var(--glass-bg-rgb) / 0.08)",
  border: "rgba(var(--glass-border-rgb) / 0.12)",
  color:  "var(--text-tertiary)",
};

function SourceBadge({ source }: { source: string }) {
  const style = SOURCE_STYLES[source] ?? DEFAULT_SOURCE_STYLE;
  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
      style={{
        background: style.bg,
        border: `1px solid ${style.border}`,
        color: style.color,
      }}
    >
      {source}
    </span>
  );
}

/* ─── Amount cell ────────────────────────────────────────────────── */

function AmountCell({ value }: { value: number }) {
  const isNegative = value < 0;
  return (
    <span
      className="font-display text-sm font-semibold"
      style={{
        letterSpacing: "var(--tracking-snug)",
        color: isNegative ? "var(--status-error)" : "var(--text-primary)",
      }}
    >
      {isNegative ? "−" : ""}${Math.abs(value).toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}
    </span>
  );
}

/* ─── Date cell ──────────────────────────────────────────────────── */

function DateCell({ value }: { value: string }) {
  const formatted = new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  return (
    <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
      {formatted}
    </span>
  );
}

/* ─── Empty state ────────────────────────────────────────────────── */

function TableEmpty() {
  return (
    <motion.div
      className="flex flex-col items-center justify-center gap-4 py-16 text-center"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 280, damping: 26 }}
    >
      <div
        className="flex h-12 w-12 items-center justify-center rounded-2xl"
        style={{
          background: "rgba(var(--glass-bg-rgb) / 0.06)",
          border: "1px solid rgba(var(--glass-border-rgb) / 0.08)",
          color: "var(--text-muted)",
        }}
      >
        <ReceiptText size={20} />
      </div>
      <div>
        <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
          No transactions yet
        </p>
        <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
          Add your first transaction using the form.
        </p>
      </div>
    </motion.div>
  );
}

/* ─── Column definitions ─────────────────────────────────────────── */

// These conform to the DataTable column spec from data-table.tsx (Batch 7).
// Using inline `render` functions for custom cell formatting.
const COLUMNS = [
  {
    key: "date",
    label: "Date",
    render: (v: unknown) => <DateCell value={String(v)} />,
  },
  {
    key: "description",
    label: "Description",
    render: (v: unknown) => (
      <span
        className="text-sm"
        style={{ color: "var(--text-primary)", maxWidth: "200px", display: "block" }}
      >
        {String(v || "—")}
      </span>
    ),
  },
  {
    key: "source",
    label: "Source",
    render: (v: unknown) => <SourceBadge source={String(v)} />,
  },
  {
    key: "amount",
    label: "Amount",
    render: (v: unknown) => <AmountCell value={Number(v)} />,
  },
] as const;

/* ─── RevenueTable ───────────────────────────────────────────────── */

export function RevenueTable() {
  const { transactions, isLoading, refetch } = useRevenue();

  if (isLoading) {
    return <SkeletonTable rows={6} columns={4} />;
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header with refresh */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
          Transactions
        </h2>
        <button
          onClick={() => void refetch()}
          className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-white/5 transition-colors"
          title="Refresh transactions"
        >
          <RefreshCw size={14} style={{ color: "var(--text-tertiary)" }} />
        </button>
      </div>

      {transactions.length === 0 ? (
        <div className="glass rounded-2xl" style={{ minHeight: "240px" }}>
          <TableEmpty />
        </div>
      ) : (
        <DataTable
          data={transactions}
          // @ts-expect-error – DataTable columns are typed generically in Batch 7
          columns={COLUMNS}
          searchKey="description"
        />
      )}
    </div>
  );
}