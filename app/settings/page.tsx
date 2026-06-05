"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import styles from "./settings.module.css";
import Link from "next/link";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function SettingsPage() {
  const { data, error, mutate } = useSWR("/api/settings", fetcher);
  
  const [maxWishes, setMaxWishes] = useState(10);
  const [minWishesToDraw, setMinWishesToDraw] = useState(10);
  const [showReceivedWishes, setShowReceivedWishes] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "error" | "success" } | null>(null);

  useEffect(() => {
    if (data && !data.message) {
      setMaxWishes(data.maxWishes);
      setMinWishesToDraw(data.minWishesToDraw);
      setShowReceivedWishes(data.showReceivedWishes);
    }
  }, [data]);

  const handleSave = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          maxWishes,
          minWishesToDraw,
          showReceivedWishes
        })
      });
      const result = await res.json();
      
      if (res.ok) {
        mutate();
        setMessage({ text: "Ajustes guardados correctamente para ambos.", type: "success" });
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ text: result.message || "Error al guardar", type: "error" });
      }
    } catch (err) {
      setMessage({ text: "Error de red", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  if (error) return <div className={styles.container}>Error cargando los ajustes.</div>;
  if (!data) return <div className={styles.container}>Cargando...</div>;

  if (data.message === "No tienes pareja vinculada") {
    return (
      <div className={styles.container}>
        <div className={styles.card} style={{ textAlign: "center", padding: "4rem 2rem" }}>
          <h1 className={styles.title} style={{ fontSize: "2rem" }}>Ajustes de Pareja</h1>
          <p style={{ color: "var(--text-secondary)", marginBottom: "2rem" }}>
            Debes vincular tu cuenta con tu pareja para poder configurar las reglas de vuestros deseos.
          </p>
          <Link href="/pairing" className="btn-primary">
            Ir a Vincular Cuenta
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Ajustes de Pareja</h1>
      
      <div className={styles.card}>
        
        <div className={styles.settingGroup}>
          <div className={styles.settingHeader}>
            <div>
              <h2 className={styles.settingTitle}>Límite del Pool</h2>
              <p className={styles.settingDescription}>Máximo de deseos que cada uno puede tener en su lista.</p>
            </div>
            <span className={styles.valueBadge}>{maxWishes} deseos</span>
          </div>
          <input 
            type="range" 
            min="1" 
            max="30" 
            value={maxWishes} 
            onChange={(e) => setMaxWishes(parseInt(e.target.value))}
            className={styles.slider}
          />
        </div>

        <div className={styles.settingGroup}>
          <div className={styles.settingHeader}>
            <div>
              <h2 className={styles.settingTitle}>Mínimo para el Sorteo</h2>
              <p className={styles.settingDescription}>Cuántos deseos debe tener cada uno como mínimo para poder lanzar el sorteo mágico.</p>
            </div>
            <span className={styles.valueBadge}>{minWishesToDraw} deseos</span>
          </div>
          <input 
            type="range" 
            min="1" 
            max={maxWishes} 
            value={Math.min(minWishesToDraw, maxWishes)} 
            onChange={(e) => setMinWishesToDraw(parseInt(e.target.value))}
            className={styles.slider}
          />
        </div>

        <div className={styles.settingGroup}>
          <div className={styles.settingHeader}>
            <div>
              <h2 className={styles.settingTitle}>Modo Sorpresa</h2>
              <p className={styles.settingDescription}>
                {showReceivedWishes 
                  ? "Puedes ver en el Dashboard los deseos que tu pareja va a cumplirte." 
                  : "Los deseos que te van a cumplir estarán ocultos. ¡Sorpresa pura!"}
              </p>
            </div>
            <label className={styles.switch}>
              <input 
                type="checkbox" 
                checked={!showReceivedWishes} // toggle logic is inverted visually for "Surprise Mode"
                onChange={(e) => setShowReceivedWishes(!e.target.checked)} 
              />
              <span className={styles.sliderToggle}></span>
            </label>
          </div>
        </div>

        <button 
          onClick={handleSave} 
          className="btn-primary" 
          disabled={loading}
          style={{ width: "100%", marginTop: "1rem" }}
        >
          {loading ? "Guardando..." : "Guardar Ajustes"}
        </button>

        {message && (
          <div className={`${styles.message} ${styles[message.type]}`}>
            {message.text}
          </div>
        )}
      </div>
    </div>
  );
}
