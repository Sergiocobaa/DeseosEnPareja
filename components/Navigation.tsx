"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import styles from "./Navigation.module.css";

export default function Navigation() {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  if (status === "loading" || !session) {
    return null; // No mostrar navbar si no hay sesión
  }

  const isActive = (path: string) => pathname === path || pathname.startsWith(path + "/");

  return (
    <nav className={styles.nav}>
      <div className={styles.navContainer}>
        <div className={styles.brand}>Deseos</div>
        <div className={styles.links}>
          <Link 
            href="/dashboard" 
            className={`${styles.navLink} ${isActive('/dashboard') ? styles.activeLink : ''}`}
          >
            <span className={styles.icon}>✦</span>
            <span>Inicio</span>
          </Link>
          <Link 
            href="/pool" 
            className={`${styles.navLink} ${isActive('/pool') ? styles.activeLink : ''}`}
          >
            <span className={styles.icon}>✧</span>
            <span>Deseos</span>
          </Link>
          <Link 
            href="/pairing" 
            className={`${styles.navLink} ${isActive('/pairing') ? styles.activeLink : ''}`}
          >
            <span className={styles.icon}>♡</span>
            <span>Pareja</span>
          </Link>
        </div>
        
        <button 
          onClick={() => signOut({ callbackUrl: "/login" })} 
          className={styles.logoutBtn}
          title="Cerrar sesión"
        >
          <span className={styles.icon}>⏏</span>
          <span className="hidden-mobile">Salir</span>
        </button>
      </div>
    </nav>
  );
}
