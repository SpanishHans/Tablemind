"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FaSpinner } from "react-icons/fa";

import Topbar from "@/components/layout/Topbar";
import Footer from "@/components/layout/Footer";

export default function ProcessingPage() {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("Iniciando procesamiento...");
  
  // Simulación de progreso del procesamiento
  useEffect(() => {
    const stages = [
      { percent: 10, text: "Preparando datos para análisis..." },
      { percent: 30, text: "Conectando con el modelo de IA..." },
      { percent: 45, text: "Enviando datos al servicio..." },
      { percent: 60, text: "Procesando información..." },
      { percent: 75, text: "Analizando resultados..." },
      { percent: 90, text: "Generando documento final..." },
      { percent: 100, text: "¡Completado! Redirigiendo..." }
    ];
    
    let currentStage = 0;
    
    const progressInterval = setInterval(() => {
      if (currentStage < stages.length) {
        setProgress(stages[currentStage].percent);
        setStatusText(stages[currentStage].text);
        currentStage++;
      } else {
        clearInterval(progressInterval);
        // Redirección a la página de resultados después de un breve retraso
        setTimeout(() => {
          window.location.href = "/results";
        }, 1500);
      }
    }, 1200); // Cada etapa toma aproximadamente 1.2 segundos
    
    return () => clearInterval(progressInterval);
  }, []);

  // Animación para el spinner
  const spinTransition = {
    loop: Infinity,
    ease: "linear",
    duration: 1
  };

  return (
    <div className="min-h-screen w-full bg-gray-900 text-white flex flex-col">
      <Topbar />
      
      <main className="flex-grow pt-20 px-6 md:px-10 lg:px-16 flex items-center justify-center">
        <div className="max-w-xl w-full">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="w-20 h-20">
              <img src="/images/logo.jpeg" alt="TableMind Logo" className="w-full h-full" />
            </div>
          </div>

          <motion.div 
            className="bg-gray-800 rounded-lg p-10 shadow-lg text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex justify-center mb-8">
              <motion.div
                animate={{ rotate: 360 }}
                transition={spinTransition}
                className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-full"
              >
                <FaSpinner className="w-10 h-10 text-white" />
              </motion.div>
            </div>
            
            <h2 className="text-2xl font-bold mb-4">Procesando tu solicitud</h2>
            <p className="text-gray-300 mb-6">{statusText}</p>
            
            {/* Progress bar */}
            <div className="w-full bg-gray-700 rounded-full h-4 mb-6">
              <motion.div 
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-4 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              ></motion.div>
            </div>
            
            <div className="flex justify-between text-sm text-gray-400">
              <span>Progreso: {progress}%</span>
              <span>Por favor, espera...</span>
            </div>
          </motion.div>

          <div className="mt-8 text-center text-gray-400 text-sm">
            <p>Este proceso puede tardar algunos minutos dependiendo del tamaño del archivo y la complejidad del análisis.</p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}