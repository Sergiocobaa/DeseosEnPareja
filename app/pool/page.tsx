"use client";

import { useState } from "react";
import useSWR from "swr";
import styles from "./pool.module.css";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function PoolPage() {
  const { data, error, mutate } = useSWR("/api/wishes", fetcher);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "error" | "success" } | null>(null);

  const wishes = data?.wishes || [];
  const maxWishes = data?.maxWishes || 10;
  const wishCount = wishes.length;
  const isFull = wishCount >= maxWishes;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || text.length > 100 || isFull) return;

    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/wishes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text.trim() }),
      });
      const result = await res.json();

      if (res.ok) {
        setText("");
        mutate(); // Revalidate SWR
        setMessage({ text: "Deseo añadido", type: "success" });
        setTimeout(() => setMessage(null), 2000);
      } else {
        setMessage({ text: result.message || "Error al añadir deseo", type: "error" });
      }
    } catch (err) {
      setMessage({ text: "Error de red", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/wishes/${id}`, { method: "DELETE" });
      const result = await res.json();
      if (res.ok) {
        mutate(); // Revalidate SWR
        setMessage({ text: "Deseo eliminado", type: "success" });
        setTimeout(() => setMessage(null), 2000);
      } else {
        setMessage({ text: result.message || "Error al eliminar deseo", type: "error" });
      }
    } catch (err) {
      setMessage({ text: "Error de red", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  if (error) return <div className={styles.container}>Error al cargar los deseos</div>;
  if (!data) return <div className={styles.container}>Cargando...</div>;

  return (
    <div className={styles.container}>
      <header className={`${styles.header} animate-fade-up`}>
        <h1 className={styles.title}>Pool de Deseos</h1>
        <div className={`${styles.counter} ${isFull ? styles.full : ""}`}>
          Tus deseos: {wishCount}/{maxWishes}
        </div>
      </header>

      <div className={`${styles.formCard} animate-fade-up delay-1`}>
        <form onSubmit={handleSubmit}>
          <textarea
            className={styles.textarea}
            placeholder="Escribe un deseo que te gustaría que tu pareja cumpla..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={100}
            disabled={loading || isFull}
          />
          <div className={styles.formFooter}>
            <span className={`${styles.charCount} ${text.length === 100 ? styles.limit : ""}`}>
              {text.length}/100
            </span>
            <button 
              type="submit" 
              className="btn-primary" 
              disabled={loading || isFull || text.trim().length === 0}
            >
              Añadir Deseo
            </button>
          </div>
        </form>
        {message && (
          <p className={`${styles.message} ${styles[message.type]}`} style={{ marginTop: "1rem" }}>
            {message.text}
          </p>
        )}
        {isFull && (
          <p className={`${styles.message} ${styles.success}`} style={{ marginTop: "1rem" }}>
            ¡Has completado tu Pool de {maxWishes} deseos! Ve al Dashboard para iniciar el sorteo.
          </p>
        )}
      </div>

      <div className={`${styles.wishList} animate-fade-up delay-2`}>
        {wishes.map((wish: any, index: number) => (
          <div key={wish.id} className={`${styles.wishCard} animate-fade-up`} style={{ animationDelay: `${0.3 + index * 0.1}s` }}>
            <span className={styles.wishText}>{wish.text}</span>
            <div className={styles.wishActions}>
              <span className={styles.wishStatus}>{wish.status}</span>
              <button 
                className={styles.btnDelete} 
                onClick={() => handleDelete(wish.id)}
                disabled={loading}
                title="Eliminar deseo"
              >
                🗑
              </button>
            </div>
          </div>
        ))}
        {wishes.length === 0 && (
          <p style={{ textAlign: "center", color: "#718096", padding: "2rem" }}>
            Aún no has añadido ningún deseo.
          </p>
        )}
      </div>
    </div>
  );
}
