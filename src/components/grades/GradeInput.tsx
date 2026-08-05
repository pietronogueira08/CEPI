"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { createOrUpdateGrade } from "@/lib/actions/grades";

interface GradeInputProps {
  studentId: string;
  subjectId: string;
  period: string;
  initialValue?: number | null;
  studentName: string;
  subjectName: string;
  onSaved?: (value: number) => void;
}

function getGradeClass(value: number | null): string {
  if (value === null) return "";
  if (value >= 7) return "grade-good";
  if (value >= 5) return "grade-warning";
  return "grade-fail";
}

function getGradeLabel(value: number | null): string {
  if (value === null) return "";
  if (value >= 7) return "Aprovado";
  if (value >= 5) return "Recuperação";
  return "Reprovado";
}

function getGradeLabelColor(value: number | null): string {
  if (value === null) return "transparent";
  if (value >= 7) return "#2D7D46";
  if (value >= 5) return "#C4622D";
  return "#DC2626";
}

export function GradeInput({
  studentId,
  subjectId,
  period,
  initialValue = null,
  studentName,
  subjectName,
  onSaved,
}: GradeInputProps) {
  const [value, setValue] = useState<string>(
    initialValue !== null ? String(initialValue) : ""
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const numValue = value !== "" ? parseFloat(value) : null;
  const isValid = numValue !== null && numValue >= 0 && numValue <= 10;
  const gradeClass = getGradeClass(numValue);
  const hasChanged = value !== (initialValue !== null ? String(initialValue) : "");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(",", ".");
    if (raw === "" || /^\d{0,2}(\.\d{0,1})?$/.test(raw)) {
      const num = parseFloat(raw);
      if (raw === "" || (!isNaN(num) && num <= 10)) {
        setValue(raw);
        setSaved(false);
        setError("");
      }
    }
  };

  const handleSave = async () => {
    if (!isValid || !hasChanged) return;
    setSaving(true);
    setError("");
    try {
      await createOrUpdateGrade({
        studentId,
        subjectId,
        period,
        value: numValue!,
      });
      setSaved(true);
      onSaved?.(numValue!);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setError(err.message || "Erro ao salvar");
    }
    setSaving(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === "Tab") {
      handleSave();
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
      {/* Input */}
      <div style={{ position: "relative" }}>
        <motion.input
          ref={inputRef}
          type="text"
          className={cn("input-premium grade-input", gradeClass)}
          value={value}
          onChange={handleChange}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          placeholder="—"
          aria-label={`Nota de ${studentName} em ${subjectName}`}
          animate={{
            scale: saving ? 0.97 : 1,
          }}
          transition={{ duration: 0.15 }}
        />

        {/* Ícone de estado */}
        <AnimatePresence>
          {saving && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              style={{
                position: "absolute",
                top: "50%",
                right: -28,
                transform: "translateY(-50%)",
              }}
            >
              <Loader2 size={16} color="#64748B" style={{ animation: "spin 0.8s linear infinite" }} />
            </motion.div>
          )}
          {saved && !saving && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              style={{
                position: "absolute",
                top: "50%",
                right: -28,
                transform: "translateY(-50%)",
              }}
            >
              <Check size={16} color="#2D7D46" strokeWidth={3} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Label da nota (Aprovado/Recuperação/Reprovado) */}
      <AnimatePresence>
        {numValue !== null && (
          <motion.span
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            style={{
              fontSize: "0.65rem",
              fontWeight: 700,
              color: getGradeLabelColor(numValue),
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            {getGradeLabel(numValue)}
          </motion.span>
        )}
      </AnimatePresence>

      {/* Erro */}
      {error && (
        <span style={{ fontSize: "0.65rem", color: "#DC2626" }}>{error}</span>
      )}
    </div>
  );
}
