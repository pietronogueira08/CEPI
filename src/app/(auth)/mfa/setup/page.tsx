"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Shield, CheckCircle, Smartphone, Loader2, Copy, Check } from "lucide-react";
import Image from "next/image";

function MfaSetupContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get("email") || "";

  const [step, setStep] = useState<"loading" | "scan" | "verify" | "done">("loading");
  const [qrCode, setQrCode] = useState("");
  const [secret, setSecret] = useState("");
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!email) { router.push("/login"); return; }
    fetch("/api/mfa/setup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.qrCode) {
          setQrCode(data.qrCode);
          setSecret(data.secret);
          setStep("scan");
        } else {
          setError("Erro ao gerar QR Code. Tente novamente.");
        }
      })
      .catch(() => setError("Erro de conexão."));
  }, [email, router]);

  const handleCopy = () => {
    navigator.clipboard.writeText(secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVerify = async () => {
    if (token.length !== 6) { setError("Digite os 6 dígitos."); return; }
    setLoading(true);
    setError("");
    const res = await fetch("/api/mfa/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, token }),
    });
    const data = await res.json();
    if (data.ok) {
      setStep("done");
      setTimeout(() => router.push("/login"), 2500);
    } else {
      setError("Código inválido. Confira o app e tente novamente.");
    }
    setLoading(false);
  };

  return (
    <div className="auth-card animate-scale-in" style={{ maxWidth: 480 }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <div style={{
          width: 72, height: 72, borderRadius: 20,
          background: "linear-gradient(135deg, #1E3A5F 0%, #2D5287 100%)",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 16px", boxShadow: "0 8px 24px rgba(30,58,95,0.35)",
        }}>
          <Shield size={34} color="white" />
        </div>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0F172A", letterSpacing: "-0.02em", marginBottom: 6 }}>
          Configurar Autenticação MFA
        </h1>
        <p style={{ color: "#64748B", fontSize: "0.85rem", lineHeight: 1.5 }}>
          Proteja sua conta com verificação em dois fatores
        </p>
      </div>

      {/* Steps */}
      {step === "loading" && (
        <div style={{ textAlign: "center", padding: 40 }}>
          <Loader2 size={40} style={{ animation: "spin 0.8s linear infinite", color: "#1E3A5F" }} />
          <p style={{ color: "#64748B", marginTop: 12 }}>Gerando seu QR Code seguro...</p>
        </div>
      )}

      {step === "scan" && (
        <div>
          {/* Instrução */}
          <div style={{
            background: "rgba(30,58,95,0.05)", border: "1px solid rgba(30,58,95,0.12)",
            borderRadius: 12, padding: 16, marginBottom: 24,
          }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
              <Smartphone size={20} color="#1E3A5F" style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <p style={{ fontWeight: 700, color: "#1E3A5F", fontSize: "0.88rem", marginBottom: 4 }}>
                  Como configurar:
                </p>
                <ol style={{ color: "#475569", fontSize: "0.82rem", lineHeight: 1.7, paddingLeft: 16, margin: 0 }}>
                  <li>Baixe o <strong>Google Authenticator</strong> ou <strong>Authy</strong> no celular</li>
                  <li>Abra o app e toque em "+" ou "Adicionar conta"</li>
                  <li>Escaneie o QR Code abaixo com a câmera do app</li>
                  <li>Digite o código de 6 dígitos que aparecerá</li>
                </ol>
              </div>
            </div>
          </div>

          {/* QR Code */}
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <div style={{
              display: "inline-block", padding: 12,
              background: "white", borderRadius: 16,
              boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
              border: "1px solid #E2E8F0",
            }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrCode} alt="QR Code MFA" width={200} height={200} style={{ display: "block" }} />
            </div>
            <p style={{ color: "#94A3B8", fontSize: "0.75rem", marginTop: 8 }}>
              Escaneie com Google Authenticator ou Authy
            </p>
          </div>

          {/* Chave manual */}
          <div style={{ marginBottom: 24 }}>
            <p style={{ fontSize: "0.78rem", color: "#64748B", marginBottom: 6, textAlign: "center" }}>
              Não consegue escanear? Use a chave manual:
            </p>
            <div style={{
              display: "flex", alignItems: "center", gap: 8,
              background: "#F8FAFC", border: "1px solid #E2E8F0",
              borderRadius: 10, padding: "10px 14px",
            }}>
              <code style={{ flex: 1, fontSize: "0.8rem", color: "#374151", letterSpacing: "0.08em", wordBreak: "break-all" }}>
                {secret}
              </code>
              <button onClick={handleCopy} style={{ background: "none", border: "none", cursor: "pointer", color: copied ? "#16A34A" : "#94A3B8", flexShrink: 0 }}>
                {copied ? <Check size={16} /> : <Copy size={16} />}
              </button>
            </div>
          </div>

          <button
            onClick={() => setStep("verify")}
            className="btn btn-primary btn-lg"
            style={{ width: "100%" }}
          >
            Já escaniei — Próximo passo
          </button>
        </div>
      )}

      {step === "verify" && (
        <div>
          <p style={{ color: "#475569", fontSize: "0.88rem", marginBottom: 20, textAlign: "center", lineHeight: 1.6 }}>
            Abra o app autenticador e digite o código de 6 dígitos que aparece para o <strong>CEPI</strong>.
          </p>

          <input
            type="text"
            className="input-premium"
            placeholder="000 000"
            value={token}
            onChange={(e) => setToken(e.target.value.replace(/\D/g, "").slice(0, 6))}
            maxLength={6}
            inputMode="numeric"
            autoFocus
            style={{ textAlign: "center", fontSize: "1.8rem", letterSpacing: "0.5em", fontWeight: 700, marginBottom: 16 }}
          />

          {error && (
            <div style={{
              background: "rgba(220,38,38,0.08)", border: "1px solid rgba(220,38,38,0.25)",
              borderRadius: 8, padding: "10px 14px", color: "#DC2626",
              fontSize: "0.82rem", marginBottom: 16, textAlign: "center",
            }}>
              {error}
            </div>
          )}

          <button
            onClick={handleVerify}
            className="btn btn-primary btn-lg"
            disabled={loading || token.length !== 6}
            style={{ width: "100%", marginBottom: 10 }}
          >
            {loading ? <><Loader2 size={18} style={{ animation: "spin 0.8s linear infinite" }} /> Verificando...</> : "Confirmar e Ativar MFA"}
          </button>

          <button
            onClick={() => setStep("scan")}
            style={{ width: "100%", background: "none", border: "none", color: "#64748B", fontSize: "0.82rem", cursor: "pointer" }}
          >
            ← Voltar e escanear novamente
          </button>
        </div>
      )}

      {step === "done" && (
        <div style={{ textAlign: "center", padding: "20px 0" }}>
          <div style={{
            width: 72, height: 72, borderRadius: "50%",
            background: "rgba(22,163,74,0.1)", display: "flex",
            alignItems: "center", justifyContent: "center",
            margin: "0 auto 16px",
          }}>
            <CheckCircle size={40} color="#16A34A" />
          </div>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#0F172A", marginBottom: 8 }}>
            MFA Ativado com sucesso! 🎉
          </h2>
          <p style={{ color: "#64748B", fontSize: "0.85rem" }}>
            Sua conta agora está protegida. Redirecionando para o login...
          </p>
        </div>
      )}
    </div>
  );
}

export default function MfaSetupPage() {
  return (
    <Suspense fallback={<div style={{ textAlign: "center", padding: 60 }}><Loader2 size={40} style={{ animation: "spin 0.8s linear infinite" }} color="#1E3A5F" /></div>}>
      <MfaSetupContent />
    </Suspense>
  );
}
