"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import styles from "./login.module.css";

export default function LoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        const res = await signIn("credentials", {
          redirect: false,
          email,
          password,
        });

        if (res?.error) {
          setError(res.error);
        } else {
          router.push("/dashboard");
        }
      } else {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        });

        const data = await res.json();

        if (res.ok) {
          // Auto-login after registration
          await signIn("credentials", {
            redirect: false,
            email,
            password,
          });
          router.push("/dashboard");
        } else {
          setError(data.message || "Error al registrarse");
        }
      }
    } catch (err) {
      setError("Ocurrió un error inesperado");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.decorator}></div>
      <div className={styles.card}>
        <h1 className={styles.title}>{isLogin ? "Iniciar Sesión" : "Crear Cuenta"}</h1>
        <p className={styles.subtitle}>
          {isLogin ? "Bienvenido de nuevo a Deseos en Pareja" : "Únete para empezar a cumplir deseos"}
        </p>

        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          {!isLogin && (
            <div className={styles.inputGroup}>
              <label className={styles.label}>Nombre</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field"
                placeholder="Tu nombre"
              />
            </div>
          )}

          <div className={styles.inputGroup}>
            <label className={styles.label}>Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              placeholder="tu@email.com"
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Contraseña</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              placeholder="••••••••"
            />
          </div>

          <button type="submit" className={`btn-primary ${styles.submitBtn}`} disabled={loading}>
            {loading ? "Cargando..." : isLogin ? "Ingresar" : "Registrarse"}
          </button>
        </form>

        <p className={styles.toggleText}>
          {isLogin ? "¿No tienes cuenta? " : "¿Ya tienes cuenta? "}
          <span className={styles.toggleLink} onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? "Regístrate aquí" : "Inicia sesión"}
          </span>
        </p>
      </div>
    </div>
  );
}
