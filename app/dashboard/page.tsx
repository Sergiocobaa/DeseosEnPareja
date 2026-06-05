"use client";

import { useState } from "react";
import useSWR from "swr";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Tutorial from "@/components/Tutorial";
import styles from "./dashboard.module.css";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function DashboardPage() {
  const router = useRouter();
  const { data, error, mutate } = useSWR("/api/dashboard", fetcher, { refreshInterval: 5000 });
  const [loading, setLoading] = useState(false);

  const handleComplete = async (id: string) => {
    setLoading(true);
    try {
      await fetch(`/api/wishes/${id}`, { method: "PATCH" });
      mutate();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDraw = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/draw", { method: "POST" });
      if (res.ok) {
        mutate();
      } else {
        alert("Error al realizar el sorteo");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (error) return <div className={styles.container}>Error cargando el dashboard.</div>;
  if (!data) return <div className={styles.container}>Cargando...</div>;

  if (!data.hasCouple) {
    return (
      <div className={styles.container}>
        <Tutorial />
        <div className={styles.column} style={{ textAlign: "center", marginTop: "4rem", padding: "4rem 2rem" }}>
          <h1 className={styles.title} style={{ fontSize: "2rem" }}>¡Aún no estás emparejado!</h1>
          <p style={{ margin: "2rem 0", color: "var(--foreground-muted)", fontSize: "1.1rem" }}>
            Para usar Deseos en Pareja, primero necesitas vincular tu cuenta con la de tu pareja.
          </p>
          <Link href="/pairing" className="btn-primary" style={{ display: "inline-block" }}>
            Ir a Vincular Cuenta
          </Link>
        </div>
      </div>
    );
  }

  const { toFulfill, toReceive, myPoolCount, partnerPoolCount, canDraw, maxWishes, minWishesToDraw } = data;
  const isDrawActive = toFulfill.length === 0 && toReceive.length === 0;

  return (
    <div className={styles.container}>
      <Tutorial />
      <header className={`${styles.header} animate-fade-up`}>
        <h1 className={styles.title}>Dashboard</h1>
        <Link href="/pool" className="btn-secondary">
          Gestionar mi Pool
        </Link>
      </header>

      {isDrawActive && (
        <div className={`${styles.drawSection} animate-fade-up delay-1`}>
          <h2 className={styles.drawTitle}>¡Es hora del sorteo!</h2>
          <p className={styles.drawSubtitle}>Ambos no tienen deseos activos por cumplir. (Se necesitan {minWishesToDraw} deseos como mínimo para sortear).</p>
          
          <div className={styles.poolStatus}>
            <div className={styles.statusItem}>
              <span className="muted-text">Tus deseos:</span> <span className="accent-text">{myPoolCount}/{maxWishes}</span>
            </div>
            <div className={styles.statusItem}>
              <span className="muted-text">Su pool:</span> <span className="accent-text">{partnerPoolCount}/{maxWishes}</span>
            </div>
          </div>

          <button 
            className={styles.btnDraw} 
            onClick={handleDraw}
            disabled={!canDraw || loading}
          >
            {canDraw ? "Iniciar Sorteo Mágico" : "Esperando a completar deseos necesarios..."}
          </button>
        </div>
      )}

      <div className={styles.grid}>
        <div className={`${styles.column} animate-fade-up delay-1`}>
          <h2 className={styles.columnTitle}>Deseos a Cumplir <span className="muted-text">(Mis Tareas)</span></h2>
          {toFulfill.length === 0 ? (
            <p className={styles.emptyState}>No tienes deseos pendientes por cumplir.</p>
          ) : (
            toFulfill.map((wish: any, index: number) => (
              <div key={wish.id} className={`${styles.wishCard} animate-fade-up`} style={{ animationDelay: `${0.2 + index * 0.1}s` }}>
                <p className={styles.wishText}>{wish.text}</p>
                <button 
                  className={styles.btnComplete}
                  onClick={() => handleComplete(wish.id)}
                  disabled={loading}
                >
                  Marcar como Completado
                </button>
              </div>
            ))
          )}
        </div>

        <div className={`${styles.column} animate-fade-up delay-2`}>
          <h2 className={styles.columnTitle}>Mis Deseos <span className="muted-text">(Lo que recibiré)</span></h2>
          {toReceive.length === 0 ? (
            <p className={styles.emptyState}>No tienes deseos activos para que te cumplan.</p>
          ) : (
            toReceive.map((wish: any, index: number) => (
              <div key={wish.id} className={`${styles.wishCard} animate-fade-up`} style={{ animationDelay: `${0.3 + index * 0.1}s` }}>
                <p className={styles.wishText}>{wish.text}</p>
                <p className="muted-text animate-pulse-soft">
                  Esperando a que lo cumpla...
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
