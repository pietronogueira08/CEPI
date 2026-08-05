"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Shield, GraduationCap, Loader2 } from "lucide-react";
import Image from "next/image";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [form, setForm] = useState({ email: "", password: "", mfaToken: "" });
  const [showMfa, setShowMfa] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
    });

    if (!result || result.error) {
      setError("Email ou senha incorretos. Tente novamente.");
    } else {
      router.push(callbackUrl);
      router.refresh();
    }

    setLoading(false);
  };

  return (
    <div className="auth-card animate-scale-in">
      {/* Logo */}
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div style={{
          width: 80,
          height: 80,
          borderRadius: 20,
          background: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 16px",
          boxShadow: "0 8px 24px rgba(30,58,95,0.15)",
          overflow: "hidden",
          padding: 8
        }}>
          <Image src="/logo.png" alt="CEPI Logo" width={64} height={64} style={{ objectFit: "contain" }} />
        </div>
        <h1 style={{
          fontSize: "1.6rem",
          fontWeight: 800,
          color: "#0F172A",
          letterSpacing: "-0.03em",
          marginBottom: 4,
        }}>
          CEPI
        </h1>
        <p style={{ color: "#64748B", fontSize: "0.85rem" }}>
          Centro Educacional Pequena Isa
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Email */}
        <div>
          <label style={{
            display: "block",
            fontSize: "0.82rem",
            fontWeight: 600,
            color: "#374151",
            marginBottom: 6,
          }}>
            Email
          </label>
          <input
            type="email"
            className="input-premium"
            placeholder="seu@email.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
            autoComplete="email"
          />
        </div>

        {/* Senha */}
        <div>
          <label style={{
            display: "block",
            fontSize: "0.82rem",
            fontWeight: 600,
            color: "#374151",
            marginBottom: 6,
          }}>
            Senha
          </label>
          <div style={{ position: "relative" }}>
            <input
              type={showPass ? "text" : "password"}
              className="input-premium"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              autoComplete="current-password"
              style={{ paddingRight: 44 }}
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              style={{
                position: "absolute",
                right: 12,
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#94A3B8",
                padding: 4,
              }}
            >
              {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {/* MFA Token (aparece condicionalmente) */}
        {showMfa && (
          <div className="animate-fade-up" style={{
            background: "rgba(30, 58, 95, 0.05)",
            border: "1px solid rgba(30, 58, 95, 0.15)",
            borderRadius: 12,
            padding: 16,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <Shield size={16} color="#1E3A5F" />
              <label style={{
                fontSize: "0.82rem",
                fontWeight: 600,
                color: "#1E3A5F",
              }}>
                Código MFA (6 dígitos)
              </label>
            </div>
            <input
              type="text"
              className="input-premium"
              placeholder="000000"
              value={form.mfaToken}
              onChange={(e) => setForm({ ...form, mfaToken: e.target.value.replace(/\D/g, "").slice(0, 6) })}
              maxLength={6}
              pattern="[0-9]{6}"
              inputMode="numeric"
              style={{ textAlign: "center", fontSize: "1.3rem", letterSpacing: "0.3em", fontWeight: 700 }}
              autoFocus
            />
            <p style={{ fontSize: "0.75rem", color: "#64748B", marginTop: 8 }}>
              Abra o Google Authenticator ou Authy e insira o código de 6 dígitos.
            </p>
          </div>
        )}

        {/* Erro */}
        {error && !showMfa && (
          <div className="animate-fade-up" style={{
            background: "rgba(220, 38, 38, 0.08)",
            border: "1px solid rgba(220, 38, 38, 0.25)",
            borderRadius: 8,
            padding: "10px 14px",
            color: "#DC2626",
            fontSize: "0.82rem",
            fontWeight: 500,
          }}>
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          className="btn btn-primary btn-lg"
          disabled={loading}
          style={{ marginTop: 8 }}
        >
          {loading ? (
            <>
              <Loader2 size={18} style={{ animation: "spin 0.8s linear infinite" }} />
              Entrando...
            </>
          ) : showMfa ? (
            <>
              <Shield size={18} />
              Verificar Código MFA
            </>
          ) : (
            "Entrar no Sistema"
          )}
        </button>
      </form>

      {/* Footer */}
      <p style={{
        textAlign: "center",
        marginTop: 24,
        fontSize: "0.75rem",
        color: "#94A3B8",
      }}>
        Grussaí, RJ · Sistema Seguro CEPI
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ textAlign: "center", padding: 60 }}><Loader2 size={40} className="animate-spin" color="#1E3A5F" /></div>}>
      <LoginContent />
    </Suspense>
  );
}
