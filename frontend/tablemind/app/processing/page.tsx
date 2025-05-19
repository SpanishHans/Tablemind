"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FaSpinner } from "react-icons/fa";
import { useRouter } from "next/navigation";
import Image from "next/image";

import Topbar from "@/components/layout/Topbar";
import Footer from "@/components/layout/Footer";

export default function ProcessingPage() {
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("Iniciando procesamiento...");
  const [error, setError] = useState("");
  const [jobData, setJobData] = useState(null);
  
  // Procesamiento real usando la API
  useEffect(() => {
    const startJob = async () => {
      try {
        // Obtener datos de localStorage
        const token = localStorage.getItem("access_token");
        if (!token) {
          router.push("/login");
          return;
        }
        
        const modelId = localStorage.getItem("currentModelId");
        const promptId = localStorage.getItem("currentPromptId");
        const mediaId = localStorage.getItem("currentMediaId");
        const detailLevel = parseFloat(localStorage.getItem("detailLevel") || "1");
        const operationMode = localStorage.getItem("operationMode") || "PER_ROW";
        const maxRows = parseInt(localStorage.getItem("maxRows") || "100");
        
        // Validar datos requeridos
        if (!modelId || !promptId || !mediaId) {
          setError("Faltan datos necesarios. Vuelve a completar los pasos anteriores.");
          return;
        }
        
        setStatusText("Preparando datos para análisis...");
        setProgress(10);
        
        // Crear FormData para la petición
        const formData = new FormData();
        formData.append("prompt_id", promptId);
        formData.append("media_id", mediaId);
        formData.append("model_id", modelId);
        formData.append("focus_column", ""); // Columna focal (opcional)
        
        // Configurar parámetros de consulta
        const queryParams = new URLSearchParams({
          granularity: operationMode,
          verbosity: detailLevel.toString(),
          chunk_size: maxRows.toString()
        });
        
        setStatusText("Conectando con el modelo de IA...");
        setProgress(20);
        
        // Llamar al API para iniciar el trabajo
        const apiUrl = "/api/job/start";
        const res = await fetch(`${apiUrl}?${queryParams.toString()}`, {
          method: "POST",
          body: formData,
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.detail || `Error ${res.status}: ${res.statusText}`);
        }
        
        setStatusText("Procesando información...");
        setProgress(30);
        
        // Obtener respuesta con el job_id
        const data = await res.json();
        console.log("Job iniciado:", data);
        setJobData(data);
        
        // Guardar el job_id para referencia futura
        localStorage.setItem("currentJobId", data.job_id);
        
        // Iniciar polling para verificar estado del trabajo
        let pollingInterval = setInterval(async () => {
          try {
            const statusRes = await fetch(`/api/job/status?job_id=${data.job_id}`, {
              headers: {
                "Authorization": `Bearer ${token}`
              }
            });
            
            if (!statusRes.ok) {
              throw new Error(`Error al verificar estado: ${statusRes.status}`);
            }
            
            const statusData = await statusRes.json();
            console.log("Estado del trabajo:", statusData);
            
            // Calcular progreso basado en chunks completados
            if (statusData.chunks_total > 0) {
              const completionPercent = Math.round(
                (statusData.chunks_completed / statusData.chunks_total) * 70
              ) + 30; // Empezamos en 30% después de iniciar el trabajo
              
              setProgress(completionPercent > 100 ? 100 : completionPercent);
              
              // Actualizar mensaje de estado según el progreso
              if (completionPercent < 50) {
                setStatusText("Procesando datos...");
              } else if (completionPercent < 75) {
                setStatusText("Analizando resultados...");
              } else if (completionPercent < 95) {
                setStatusText("Generando documento final...");
              } else {
                setStatusText("¡Completado! Redirigiendo...");
              }
            }
            
            // Si el trabajo está terminado, redirigir a resultados
            if (statusData.status === "FINISHED") {
              clearInterval(pollingInterval);
              setProgress(100);
              setStatusText("¡Completado! Redirigiendo...");
              
              // Redirigir a la página de resultados después de un breve retraso
              setTimeout(() => {
                router.push("/results");
              }, 1500);
            }
          } catch (error) {
            console.error("Error en polling de estado:", error);
            // Continuar intentando a pesar de errores en el polling
          }
        }, 2000); // Verificar cada 2 segundos
        
        // Limpiar intervalo al desmontar
        return () => {
          if (pollingInterval) clearInterval(pollingInterval);
        };
      } catch (error) {
        console.error("Error al iniciar el trabajo:", error);
        setError(error instanceof Error ? error.message : "Error al conectar con el servidor");
        setProgress(0);
      }
    };
    
    startJob();
  }, [router]);

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
            <div className="w-20 h-20 relative">
              <Image
                src="/images/logo.jpeg"
                alt="TableMind Logo"
                fill
                sizes="80px"
                className="object-contain"
              />
            </div>
          </div>

          {error ? (
            <motion.div
              className="bg-red-500/20 border border-red-500/30 rounded-lg p-8 shadow-lg text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="text-red-400 text-4xl mb-4">
                <span>⚠️</span>
              </div>
              <h2 className="text-2xl font-bold mb-4 text-red-300">Error en el procesamiento</h2>
              <p className="text-gray-300 mb-6">{error}</p>
              <button
                onClick={() => router.push("/model")}
                className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Volver a intentar
              </button>
            </motion.div>
          ) : (
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
          )}

          <div className="mt-8 text-center text-gray-400 text-sm">
            <p>Este proceso puede tardar algunos minutos dependiendo del tamaño del archivo y la complejidad del análisis.</p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}