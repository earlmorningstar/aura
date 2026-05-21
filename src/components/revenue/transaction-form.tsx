"use client";

/**
 * TransactionForm — add-transaction panel on the Revenue page.
 *
 * Features:
 * - Glassmorphic inputs using design token variables
 * - Custom styled select replacing native <select>
 * - Field-level validation with animated error messages
 * - Success state with scale + fade animation after submit
 * - Loading state on submit button
 * - All colours from design tokens — zero magic values
 */

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, ChevronDown, CheckCircle2, AlertCircle } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { GlassButton } from "@/components/ui/glass-button";
import { useRevenue } from "@/hooks/use-revenue";
import { cn } from "@/lib/utils";

/* ─── Types ──────────────────────────────────────────────────────── */

interface FormState {
  amount: string;
  source: string;
  description: string;
}

interface FormErrors {
  amount?: string;
  description?: string;
}

const SOURCES = ["Stripe", "Gumroad", "Affiliate", "PayPal", "Other"] as const;
type Source = (typeof SOURCES)[number];

/* ─── Shared input wrapper ───────────────────────────────────────── */

interface FieldProps {
  label: string;
  error?: string;
  children: React.ReactNode;
  htmlFor?: string;
}

function Field({ label, error, children, htmlFor }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={htmlFor}
        className="text-xs font-medium"
        style={{
          letterSpacing: "var(--tracking-caps)",
          textTransform: "uppercase",
          color: "var(--text-tertiary)",
        }}
      >
        {label}
      </label>
      {children}
      <AnimatePresence>
        {error && (
          <motion.p
            className="flex items-center gap-1.5 text-xs"
            style={{ color: "var(--status-error)" }}
            initial={{ opacity: 0, y: -4, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -4, height: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
          >
            <AlertCircle size={11} aria-hidden />
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Glassmorphic text input ────────────────────────────────────── */

interface GlassInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean;
}

function GlassInput({ hasError, className, ...props }: GlassInputProps) {
  return (
    <input
      className={cn("input", className)}
      style={{
        // Override border color if error
        ...(hasError
          ? {
            borderColor: "rgba(var(--status-error-rgb) / 0.45)",
            boxShadow: "0 0 0 3px rgba(var(--status-error-rgb) / 0.08)",
          }
          : {}),
      }}
      {...props}
    />
  );
}

/* ─── Custom glassmorphic select ─────────────────────────────────── */

interface GlassSelectProps {
  value: Source;
  onChange: (value: Source) => void;
  options: readonly Source[];
  id?: string;
}

function GlassSelect({ value, onChange, options, id }: GlassSelectProps) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={ref} className="relative" id={id}>
      {/* Trigger */}
      <motion.button
        type="button"
        className="input flex w-full items-center justify-between text-left"
        onClick={() => setOpen((o) => !o)}
        whileTap={{ scale: 0.98, transition: { type: "spring", stiffness: 600, damping: 28 } }}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span style={{ color: "var(--text-primary)" }}>{value}</span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 26 }}
          aria-hidden
        >
          <ChevronDown size={14} style={{ color: "var(--text-tertiary)" }} />
        </motion.span>
      </motion.button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.ul
            role="listbox"
            className="absolute left-0 right-0 top-full z-[var(--z-dropdown)] mt-1 overflow-hidden rounded-xl py-1"
            style={{
              background: "rgba(10, 10, 18, 0.92)",
              backdropFilter: "blur(var(--glass-blur-lg)) saturate(180%)",
              WebkitBackdropFilter: "blur(var(--glass-blur-lg)) saturate(180%)",
              border: "1px solid rgba(var(--glass-border-rgb) / var(--glass-border-opacity-strong))",
              boxShadow: "var(--shadow-lg)",
            }}
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
          >
            {options.map((opt) => (
              <li key={opt} role="option" aria-selected={opt === value}>
                <motion.button
                  type="button"
                  className="flex w-full items-center px-3 py-2.5 text-sm"
                  style={{
                    color: opt === value ? "var(--text-primary)" : "var(--text-secondary)",
                    background:
                      opt === value ? "rgba(var(--glass-bg-rgb) / 0.1)" : "transparent",
                  }}
                  whileHover={{
                    background: "rgba(var(--glass-bg-rgb) / 0.08)",
                    color: "var(--text-primary)",
                  }}
                  onClick={() => { onChange(opt); setOpen(false); }}
                >
                  {opt}
                </motion.button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Success overlay ────────────────────────────────────────────── */

interface SuccessOverlayProps {
  onDone: () => void;
}

function SuccessOverlay({ onDone }: SuccessOverlayProps) {
  React.useEffect(() => {
    const t = setTimeout(onDone, 1800);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <motion.div
      className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-2xl"
      style={{
        background: "rgba(var(--status-success-rgb) / 0.06)",
        backdropFilter: "blur(4px)",
        border: "1px solid rgba(var(--status-success-rgb) / 0.15)",
      }}
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ type: "spring", stiffness: 400, damping: 26 }}
    >
      <motion.div
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 22, delay: 0.05 }}
      >
        <CheckCircle2 size={36} style={{ color: "var(--status-success)" }} />
      </motion.div>
      <p
        className="font-display font-semibold"
        style={{ color: "var(--text-primary)" }}
      >
        Transaction added!
      </p>
      <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
        Your revenue has been updated.
      </p>
    </motion.div>
  );
}

/* ─── TransactionForm ────────────────────────────────────────────── */

export function TransactionForm() {
  const { addTransaction, refetch } = useRevenue();

  const [form, setForm] = React.useState<FormState>({
    amount: "",
    source: "Stripe",
    description: "",
  });
  const [errors, setErrors] = React.useState<FormErrors>({});
  const [submitting, setSubmitting] = React.useState(false);
  const [success, setSuccess] = React.useState(false);

  const update = (key: keyof FormState, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    // Clear error on change
    if (errors[key as keyof FormErrors]) {
      setErrors((e) => ({ ...e, [key]: undefined }));
    }
  };

  const validate = (): boolean => {
    const next: FormErrors = {};

    const numAmount = parseFloat(form.amount);
    if (!form.amount.trim()) {
      next.amount = "Amount is required";
    } else if (isNaN(numAmount) || numAmount <= 0) {
      next.amount = "Enter a valid positive number";
    } else if (numAmount > 1_000_000) {
      next.amount = "Amount exceeds maximum";
    }

    if (form.description.trim().length > 120) {
      next.description = "Description must be under 120 characters";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };
  
  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      await addTransaction({
        date: new Date().toISOString().split("T")[0]!,
        amount: parseFloat(form.amount),
        source: form.source,
        description: form.description.trim() || "Manual entry",
      });
      refetch();
      setForm({ amount: "", source: "Stripe", description: "" });
      setSuccess(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <GlassCard visual="default" padding="md" className="relative">
      {/* ── Success overlay ──────────────────────────────────── */}
      <AnimatePresence>
        {success && (
          <SuccessOverlay onDone={() => setSuccess(false)} />
        )}
      </AnimatePresence>

      {/* ── Heading ─────────────────────────────────────────── */}
      <div className="mb-5 flex items-center gap-2.5">
        <div
          className="flex h-7 w-7 items-center justify-center rounded-lg"
          style={{
            background: "rgba(var(--accent-cyan-rgb) / 0.1)",
            border: "1px solid rgba(var(--accent-cyan-rgb) / 0.15)",
            color: "var(--accent-cyan)",
          }}
          aria-hidden
        >
          <Plus size={14} />
        </div>
        <h3
          className="font-display text-sm font-semibold"
          style={{ color: "var(--text-primary)" }}
        >
          Add Transaction
        </h3>
      </div>

      {/* ── Fields ──────────────────────────────────────────── */}
      <div className="flex flex-col gap-4">
        {/* Amount */}
        <Field label="Amount (USD)" error={errors.amount} htmlFor="tx-amount">
          <GlassInput
            id="tx-amount"
            type="number"
            inputMode="decimal"
            placeholder="0.00"
            min="0"
            step="0.01"
            value={form.amount}
            onChange={(e) => update("amount", e.target.value)}
            hasError={!!errors.amount}
            aria-invalid={!!errors.amount}
            aria-describedby={errors.amount ? "tx-amount-error" : undefined}
          />
        </Field>

        {/* Source */}
        <Field label="Source" htmlFor="tx-source">
          <GlassSelect
            id="tx-source"
            value={form.source as Source}
            onChange={(v) => update("source", v)}
            options={SOURCES}
          />
        </Field>

        {/* Description */}
        <Field label="Description (optional)" error={errors.description} htmlFor="tx-desc">
          <GlassInput
            id="tx-desc"
            type="text"
            placeholder="e.g. Course sale — Advanced TypeScript"
            maxLength={120}
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            hasError={!!errors.description}
          />
          {/* Character counter */}
          {form.description.length > 80 && (
            <p
              className="text-right text-[11px]"
              style={{
                color:
                  form.description.length > 110
                    ? "var(--status-warning)"
                    : "var(--text-muted)",
              }}
            >
              {120 - form.description.length} remaining
            </p>
          )}
        </Field>
      </div>

      {/* ── Submit ──────────────────────────────────────────── */}
      <div className="mt-5">
        <GlassButton
          variant="primary"
          size="md"
          className="w-full"
          loading={submitting}
          leadingIcon={<Plus size={14} />}
          onClick={() => void handleSubmit()}
        >
          Add to Revenue
        </GlassButton>
      </div>
    </GlassCard>
  );
}