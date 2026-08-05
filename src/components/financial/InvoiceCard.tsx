"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown, ChevronUp, CreditCard, Calendar, CheckCircle,
  AlertCircle, Clock, Copy, QrCode, Loader2
} from "lucide-react";
import { formatCurrency, formatDate, getStatusLabel, getInvoiceStatusColor, getMonthName } from "@/lib/utils";
import { updateInvoiceStatus } from "@/lib/actions/financial";

interface Invoice {
  id: string;
  description: string;
  amount: number;
  dueDate: Date | string;
  paidAt?: Date | string | null;
  status: string;
  month: number;
  year: number;
  barCode?: string | null;
  pixCode?: string | null;
}

interface InvoiceCardProps {
  invoice: Invoice;
  canManage?: boolean;
}

const STATUS_ICONS = {
  PENDING: Clock,
  PAID: CheckCircle,
  OVERDUE: AlertCircle,
  CANCELLED: AlertCircle,
};

export function InvoiceCard({ invoice, canManage = false }: InvoiceCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [marking, setMarking] = useState(false);
  const [paid, setPaid] = useState(invoice.status === "PAID");
  const [copied, setCopied] = useState<"barcode" | "pix" | null>(null);

  const StatusIcon = STATUS_ICONS[invoice.status as keyof typeof STATUS_ICONS] || Clock;
  const statusColor = getInvoiceStatusColor(paid ? "PAID" : invoice.status);

  const handleMarkAsPaid = async () => {
    setMarking(true);
    try {
      await updateInvoiceStatus(invoice.id, "PAID");
      setPaid(true);
    } catch (err) {
      console.error(err);
    }
    setMarking(false);
  };

  const copyToClipboard = (text: string, type: "barcode" | "pix") => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <motion.div
      className={`invoice-card ${paid ? "invoice-paid-overlay" : ""}`}
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header do card */}
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          width: "100%",
          padding: "16px 20px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          background: "none",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        {/* Ícone de status */}
        <div style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          background: paid
            ? "rgba(45, 125, 70, 0.1)"
            : invoice.status === "OVERDUE"
            ? "rgba(220, 38, 38, 0.1)"
            : "rgba(30, 58, 95, 0.08)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}>
          <StatusIcon
            size={20}
            color={paid ? "#2D7D46" : invoice.status === "OVERDUE" ? "#DC2626" : "#1E3A5F"}
          />
        </div>

        {/* Informações principais */}
        <div style={{ flex: 1, overflow: "hidden" }}>
          <div style={{
            fontSize: "0.9rem",
            fontWeight: 600,
            color: "#0F172A",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}>
            {invoice.description}
          </div>
          <div style={{ fontSize: "0.78rem", color: "#64748B", marginTop: 2 }}>
            {getMonthName(invoice.month)}/{invoice.year} · Vence {formatDate(invoice.dueDate)}
          </div>
        </div>

        {/* Valor e Status */}
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div style={{
            fontSize: "1.05rem",
            fontWeight: 800,
            color: "#0F172A",
            letterSpacing: "-0.02em",
          }}>
            {formatCurrency(invoice.amount)}
          </div>
          <span className={`badge ${statusColor}`} style={{ marginTop: 4 }}>
            {getStatusLabel(paid ? "PAID" : invoice.status)}
          </span>
        </div>

        {/* Chevron */}
        <div style={{ color: "#94A3B8", marginLeft: 8, flexShrink: 0 }}>
          {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
      </button>

      {/* Conteúdo expandido */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            key="expanded"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            style={{ overflow: "hidden" }}
          >
            <div style={{
              padding: "0 20px 20px",
              borderTop: "1px solid #F1F5F9",
              paddingTop: 16,
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}>
              {/* Detalhes da fatura */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
              }}>
                <DetailItem
                  icon={<Calendar size={14} />}
                  label="Vencimento"
                  value={formatDate(invoice.dueDate)}
                />
                <DetailItem
                  icon={<CreditCard size={14} />}
                  label="Valor"
                  value={formatCurrency(invoice.amount)}
                  highlight
                />
                {paid && invoice.paidAt && (
                  <DetailItem
                    icon={<CheckCircle size={14} color="#2D7D46" />}
                    label="Pago em"
                    value={formatDate(invoice.paidAt)}
                  />
                )}
              </div>

              {/* Código de barras */}
              {invoice.barCode && !paid && (
                <div style={{
                  background: "#F8FAFC",
                  borderRadius: 10,
                  padding: "12px 14px",
                  border: "1px solid #E2E8F0",
                }}>
                  <p style={{ fontSize: "0.72rem", fontWeight: 600, color: "#64748B", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                    Linha Digitável
                  </p>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <code style={{ flex: 1, fontSize: "0.75rem", color: "#1E3A5F", wordBreak: "break-all", fontFamily: "monospace" }}>
                      {invoice.barCode}
                    </code>
                    <button
                      onClick={() => copyToClipboard(invoice.barCode!, "barcode")}
                      className="btn btn-ghost btn-sm"
                      style={{ flexShrink: 0, padding: "6px 10px" }}
                    >
                      {copied === "barcode" ? <CheckCircle size={14} color="#2D7D46" /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>
              )}

              {/* PIX */}
              {invoice.pixCode && !paid && (
                <div style={{
                  background: "#F0FDF4",
                  borderRadius: 10,
                  padding: "12px 14px",
                  border: "1px solid #BBF7D0",
                }}>
                  <p style={{ fontSize: "0.72rem", fontWeight: 600, color: "#15803D", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                    Código PIX
                  </p>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <QrCode size={18} color="#15803D" />
                    <code style={{ flex: 1, fontSize: "0.75rem", color: "#15803D", wordBreak: "break-all", fontFamily: "monospace" }}>
                      {invoice.pixCode.slice(0, 40)}...
                    </code>
                    <button
                      onClick={() => copyToClipboard(invoice.pixCode!, "pix")}
                      className="btn btn-ghost btn-sm"
                      style={{ flexShrink: 0, padding: "6px 10px", borderColor: "#BBF7D0" }}
                    >
                      {copied === "pix" ? <CheckCircle size={14} color="#2D7D46" /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>
              )}

              {/* Botão de marcar como pago (admin/secretary) */}
              {canManage && !paid && (
                <motion.button
                  className="btn btn-success"
                  style={{ width: "100%" }}
                  onClick={handleMarkAsPaid}
                  disabled={marking}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {marking ? (
                    <>
                      <Loader2 size={16} style={{ animation: "spin 0.8s linear infinite" }} />
                      Registrando pagamento...
                    </>
                  ) : (
                    <>
                      <CheckCircle size={16} />
                      Marcar como Pago
                    </>
                  )}
                </motion.button>
              )}

              {/* Feedback de sucesso */}
              {paid && (
                <motion.div
                  className="animate-success"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    background: "rgba(45, 125, 70, 0.1)",
                    border: "1px solid rgba(45, 125, 70, 0.3)",
                    borderRadius: 10,
                    padding: "12px 16px",
                  }}
                >
                  <CheckCircle size={20} color="#2D7D46" />
                  <div>
                    <p style={{ fontWeight: 600, color: "#2D7D46", fontSize: "0.85rem" }}>
                      Pagamento Confirmado
                    </p>
                    {invoice.paidAt && (
                      <p style={{ fontSize: "0.75rem", color: "#4ADE80" }}>
                        {formatDate(invoice.paidAt)}
                      </p>
                    )}
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function DetailItem({
  icon,
  label,
  value,
  highlight = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div style={{
      background: highlight ? "rgba(30, 58, 95, 0.04)" : "#F8FAFC",
      borderRadius: 8,
      padding: "10px 12px",
      border: "1px solid #E2E8F0",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 4, color: "#64748B" }}>
        {icon}
        <span style={{ fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>
          {label}
        </span>
      </div>
      <p style={{
        fontSize: highlight ? "1rem" : "0.85rem",
        fontWeight: highlight ? 700 : 600,
        color: "#0F172A",
      }}>
        {value}
      </p>
    </div>
  );
}
