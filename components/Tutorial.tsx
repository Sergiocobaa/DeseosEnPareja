"use client";

import { useState, useEffect } from "react";
import styles from "./Tutorial.module.css";
import Link from "next/link";

const TUTORIAL_STEPS = [
  {
    title: "Bienvenido a Deseos",
    description: "Una experiencia íntima para intercambiar y cumplir deseos con tu pareja. Te enseñaremos cómo funciona en 3 pasos rápidos.",
    button: "Siguiente"
  },
  {
    title: "Paso 1: Vincular",
    description: "Ve a la sección 'Pareja' para generar un código o introducir el de tu pareja. Es esencial estar vinculados para que la magia funcione.",
    button: "Siguiente"
  },
  {
    title: "Paso 2: El Pool",
    description: "En 'Pool' puedes añadir los deseos que te gustaría que tu pareja te cumpliera. Puedes tener hasta 10 deseos activos a la vez.",
    button: "Siguiente"
  },
  {
    title: "Paso 3: El Sorteo",
    description: "Cuando ambos estéis listos, podréis realizar el sorteo en el Dashboard. El sistema elegirá un deseo al azar para cada uno. ¡Disfrutad!",
    button: "Empezar"
  }
];

export default function Tutorial() {
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // Verificar si ya ha visto el tutorial
    const hasSeenTutorial = localStorage.getItem("tutorialCompleted");
    if (!hasSeenTutorial) {
      setIsVisible(true);
    }
  }, []);

  const handleNext = () => {
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      finishTutorial();
    }
  };

  const finishTutorial = () => {
    localStorage.setItem("tutorialCompleted", "true");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  const step = TUTORIAL_STEPS[currentStep];

  return (
    <div className={styles.overlay}>
      <div className={`${styles.modal} animate-fade-up`}>
        <span className={styles.stepIndicator}>
          {currentStep === 0 ? "Introducción" : `Paso ${currentStep} de 3`}
        </span>
        
        <h2 className={styles.title}>{step.title}</h2>
        <p className={styles.description}>{step.description}</p>
        
        <div className={styles.dots}>
          {TUTORIAL_STEPS.map((_, index) => (
            <div 
              key={index} 
              className={`${styles.dot} ${index === currentStep ? styles.dotActive : ''}`} 
            />
          ))}
        </div>

        <div className={styles.controls}>
          <button onClick={finishTutorial} className={styles.skipBtn}>
            Saltar
          </button>
          <button onClick={handleNext} className="btn-primary">
            {step.button}
          </button>
        </div>
      </div>
    </div>
  );
}
