"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import styles from "./pairing.module.css";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function PairingPage() {
  const router = useRouter();
  const { data: pairingStatus, mutate } = useSWR("/api/pairing/status", fetcher);
  const [code, setCode] = useState<string>("");
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "error" | "success" } | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/pairing/generate", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setGeneratedCode(data.code);
        setMessage({ text: "Código generado. Compártelo con tu pareja.", type: "success" });
      } else {
        setMessage({ text: data.message || "Error al generar", type: "error" });
      }
    } catch (err) {
      setMessage({ text: "Error de red", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (code.length !== 6) {
      setMessage({ text: "El código debe tener 6 caracteres", type: "error" });
      return;
    }

    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/pairing/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.toUpperCase() })
      });
      const data = await res.json();
      if (res.ok) {
        mutate();
        setMessage({ text: "¡Emparejamiento exitoso!", type: "success" });
        setTimeout(() => {
          router.push("/dashboard");
        }, 1500);
      } else {
        setMessage({ text: data.message || "Error al unirse", type: "error" });
      }
    } catch (err) {
      setMessage({ text: "Error de red", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleUnlink = async () => {
    if (!confirm("¿Estás seguro de que quieres desvincular tu cuenta? Esto eliminará todos los deseos pendientes entre ambos.")) return;
    
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/pairing/unlink", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        mutate();
        setMessage({ text: "Cuenta desvinculada exitosamente", type: "success" });
      } else {
        setMessage({ text: data.message || "Error al desvincular", type: "error" });
      }
    } catch (err) {
      setMessage({ text: "Error de red", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={`${styles.card} animate-fade-up`}>
        {pairingStatus?.isPaired ? (
          <>
            <h1 className={styles.title}>Estás Vinculado</h1>
            <p className={styles.subtitle}>
              Actualmente compartes tu cuenta con <strong className="accent-text">{pairingStatus.partner?.name}</strong>.
            </p>
            <div className={styles.section} style={{ borderBottom: 'none', paddingBottom: 0 }}>
              <button 
                onClick={handleUnlink} 
                className="btn-secondary" 
                style={{ width: '100%', borderColor: 'rgba(255, 74, 74, 0.3)', color: 'var(--error)' }}
                disabled={loading}
              >
                {loading ? "Desvinculando..." : "Desvincular Cuenta"}
              </button>
            </div>
          </>
        ) : (
          <>
            <h1 className={styles.title}>Vincular Cuenta</h1>
            <p className={styles.subtitle}>Conéctate con tu pareja para empezar a intercambiar deseos.</p>

            <div className={styles.section}>
              <h2 className={styles.title} style={{ fontSize: '1.2rem' }}>Tengo un código</h2>
              <input
                type="text"
                placeholder="Ej. A1B2C3"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                maxLength={6}
                className={`input-field ${styles.input}`}
                disabled={loading}
              />
              <button 
                onClick={handleJoin} 
                className="btn-primary" 
                style={{ width: '100%' }}
                disabled={loading || code.length !== 6}
              >
                {loading ? "Verificando..." : "Vincular"}
              </button>
            </div>

            <div className={styles.section}>
              <h2 className={styles.title} style={{ fontSize: '1.2rem' }}>O invita a tu pareja</h2>
              {generatedCode ? (
                <div className={styles.codeBox}>{generatedCode}</div>
              ) : (
                <button 
                  onClick={handleGenerate} 
                  className="btn-secondary" 
                  style={{ width: '100%' }}
                  disabled={loading}
                >
                  Generar Código
                </button>
              )}
            </div>
          </>
        )}

        {message && (
          <p className={`${styles.message} ${styles[message.type]}`}>
            {message.text}
          </p>
        )}
      </div>
    </div>
  );
}
