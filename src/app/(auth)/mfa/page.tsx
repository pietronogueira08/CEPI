"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Shield, CheckCircle, Copy, Loader2 } from "lucide-react";
import Image from "next/image";

function MfaSetupContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get("email") || "";

  const [qrCode, setQrCode] = useState<string>("");
  const [secret, setSecret] = useState<string>("");
  const [token, setToken] = useState("");
  const [step, setStep] = useState<"qr" | "verify" | "success">("qr");
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Fetch QR code and secret from API
    fetch("/api/mfa/setup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    })
      .then((r) => r.json())
      .then((data) => {
        setQrCode(data.qrCode);
        setSecret(data.secret);
        setLoading(false);
      })
      .catch(() => {
        setError("Erro ao gerar QR Code. Tente novamente.");
        setLoading(false);
      });
  }, [email]);

  const copySecret = () => {
    navigator.clipboard.writeText(secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const verifyToken = async () => {
    if (token.length !== 6) {
      setError("Digite 6 dígitos");
      return;
    }
    setVerifying(true);
    setError("");
    try {
      const res = await fetch("/api/mfa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token, secret }),
      });
      const data = await res.json();
      if (data.success) {
        setStep("success");
        setTimeout(() => router.push("/login"), 2500);
      } else {
        setError("Código inválido. Verifique seu aplicativo e tente novamente.");
      }
    } catch {
      setError("Erro de conexão. Tente novamente.");
    }
    setVerifying(false);
  };

  if (loading) {
    return (
      <div className="auth-card" style={{ textAlign: "center", padding: 60 }}>
        <Loader2 size={40} color="#1E3A5F" style={{ animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
        <p style={{ color: "#64748B" }}>Gerando seu QR Code seguro...</p>
      </div>
    );
  }

  if (step === "success") {
    return (
      <div className="auth-card animate-scale-in" style={{ textAlign: "center", padding: 60 }}>
        <div className="animate-success" style={{ marginBottom: 20 }}>
          <CheckCircle size={72} color="#2D7D46" style={{ margin: "0 auto" }} />
        </div>
        <h2 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#0F172A", marginBottom: 8 }}>
          MFA Configurado!
        </h2>
        <p style={{ color: "#64748B" }}>
          Sua conta está protegida. Redirecionando para o login...
        </p>
      </div>
    );
  }

  return (
    <div className="auth-card animate-scale-in">
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <div style={{
          width: 56,
          height: 56,
          borderRadius: 16,
          background: "linear-gradient(135deg, #1E3A5F, #2D5287)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 14px",
        }}>
          <Shield size={28} color="white" />
        </div>
        <h1 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#0F172A", marginBottom: 6 }}>
          Configurar Autenticação MFA
        </h1>
        <p style={{ color: "#64748B", fontSize: "0.85rem" }}>
          Obrigatório para sua função. Siga os passos abaixo.
        </p>
      </div>

      {step === "qr" ? (
        <div>
          {/* Passo 1 */}
          <div style={{
            background: "#F8FAFC",
            borderRadius: 12,
            padding: 20,
            marginBottom: 20,
            border: "1px solid #E2E8F0",
          }}>
            <p style={{ fontWeight: 600, color: "#1E3A5F", fontSize: "0.85rem", marginBottom: 12 }}>
              1. Instale um aplicativo autenticador
            </p>
            <p style={{ color: "#64748B", fontSize: "0.8rem" }}>
              Google Authenticator, Authy ou Microsoft Authenticator.
            </p>
          </div>

          {/* QR Code */}
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <p style={{ fontWeight: 600, color: "#1E3A5F", fontSize: "0.85rem", marginBottom: 14 }}>
              2. Escaneie o QR Code
            </p>
            {qrCode && (
              <div style={{
                display: "inline-block",
                padding: 12,
                background: "white",
                borderRadius: 12,
                border: "2px solid #E2E8F0",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              }}>
                <Image src={qrCode} alt="QR Code MFA" width={200} height={200} />
              </div>
            )}
          </div>

          {/* Código manual */}
          <div style={{ marginBottom: 24 }}>
            <p style={{ fontWeight: 600, color: "#1E3A5F", fontSize: "0.8rem", marginBottom: 8 }}>
              Ou insira o código manualmente:
            </p>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "#F1F5F9",
              borderRadius: 8,
              padding: "10px 14px",
            }}>
              <code style={{
                flex: 1,
                fontSize: "0.8rem",
                fontFamily: "monospace",
                color: "#1E3A5F",
                letterSpacing: "0.1em",
                wordBreak: "break-all",
              }}>
                {secret}
              </code>
              <button
                onClick={copySecret}
                className="btn btn-ghost btn-sm"
                style={{ flexShrink: 0, padding: "6px 10px" }}
              >
                {copied ? <CheckCircle size={14} color="#2D7D46" /> : <Copy size={14} />}
              </button>
            </div>
          </div>

          <button
            className="btn btn-primary"
            style={{ width: "100%" }}
            onClick={() => setStep("verify")}
          >
            Já escaniei → Verificar
          </button>
        </div>
      ) : (
        <div>
          <p style={{ fontWeight: 600, color: "#1E3A5F", fontSize: "0.85rem", marginBottom: 16, textAlign: "center" }}>
            3. Digite o código gerado pelo app
          </p>
          <input
            type="text"
            className="input-premium"
            placeholder="000000"
            value={token}
            onChange={(e) => setToken(e.target.value.replace(/\D/g, "").slice(0, 6))}
            maxLength={6}
            inputMode="numeric"
            style={{
              textAlign: "center",
              fontSize: "1.6rem",
              letterSpacing: "0.4em",
              fontWeight: 700,
              marginBottom: 16,
            }}
            autoFocus
          />
          {error && (
            <div style={{
              background: "rgba(220,38,38,0.08)",
              border: "1px solid rgba(220,38,38,0.25)",
              borderRadius: 8,
              padding: "10px 14px",
              color: "#DC2626",
              fontSize: "0.82rem",
              marginBottom: 16,
            }}>
              {error}
            </div>
          )}
          <button
            className="btn btn-primary"
            style={{ width: "100%" }}
            onClick={verifyToken}
            disabled={verifying || token.length !== 6}
          >
            {verifying ? (
              <><Loader2 size={16} style={{ animation: "spin 0.8s linear infinite" }} /> Verificando...</>
            ) : (
              <><Shield size={16} /> Confirmar e Ativar MFA</>
            )}
          </button>
          <button
            className="btn btn-ghost btn-sm"
            style={{ width: "100%", marginTop: 8 }}
            onClick={() => setStep("qr")}
          >
            ← Voltar ao QR Code
          </button>
        </div>
      )}
    </div>
  );
}

export default function MfaSetupPage() {
  return (
    <Suspense fallback={<div style={{ textAlign: "center", padding: 60 }}><Loader2 size={40} className="animate-spin" color="#1E3A5F" /></div>}>
      <MfaSetupContent />
    </Suspense>
  );
}
