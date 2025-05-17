"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaArrowRight, FaLightbulb } from "react-icons/fa";
import { useRouter } from "next/navigation";
import Image from 'next/image';

import Topbar from "@/components/layout/Topbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";

export default function PromptPage() {
  const router = useRouter();
  const [promptText, setPromptText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  // Check authentication on component mount
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("access_token");
      if (!token) {
        // Redirect to login if no token is found
        router.push("/login");
      } else {
        setCheckingAuth(false);
      }
    };
    
    checkAuth();
  }, [router]);

  // Manejar el envío del formulario
  const handleSubmit = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!promptText.trim()) {
      return;
    }

    try {
      setIsLoading(true);
      setErrorMsg("");
      
      // Preparar los datos para enviar al backend
      const formData = new FormData();
      // Usando el nombre del campo que espera el backend según schemas/prompt.py
      formData.append("prompt_text", promptText);

      // Usar el proxy API configurado en next.config.js que corresponde a 'router/prompt.py'
      const apiUrl = "/api/prompt/new";

      const res = await fetch(apiUrl, {
        method: "POST",
        body: formData,
        credentials: "include",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("access_token")}`
        }
      });

      const data = await res.json();
      
      if (!res.ok) {
        setErrorMsg(data.detail || "Error al guardar el prompt");
        return;
      }

      // Guardar el prompt_id en localStorage para usarlo en siguientes pasos
      // La respuesta viene en formato ResponsePrompt según schemas/prompt.py
      localStorage.setItem("currentPromptId", data.prompt_id);
      
      // Redirigir al usuario a la siguiente página
      router.push("/model-select");
    } catch (error) {
      console.error("Error de conexión con el servidor:", error);
      setErrorMsg("Error de conexión con el servidor. Inténtalo de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  // If still checking authentication, show loading state
  if (checkingAuth) {
    return (
      <div className="min-h-screen w-full bg-gray-900 text-white flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        <p className="mt-4 text-gray-400">Verificando credenciales...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gray-900 text-white flex flex-col">
      <Topbar />
      
      <main className="flex-grow pt-20 px-6 md:px-10 lg:px-16">
        <div className="max-w-3xl mx-auto py-8">
          {/* Header with Logo */}
          <motion.div 
            className="mb-8 text-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 flex items-center justify-center relative">
                <Image
                  src="/images/logo.jpeg"
                  alt="TableMind Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </div>
            <h1 className="text-3xl font-bold">¿Qué trabajo quieres realizar?</h1>
            <p className="text-gray-400 mt-2">Describe la tarea que deseas que TableMind realice con tus datos</p>
          </motion.div>

          {/* Prompt Input Form */}
          <motion.div
            className="bg-gray-800 rounded-lg shadow-lg p-6 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div>
              {errorMsg && (
                <div className="bg-red-600/80 text-white p-3 rounded mb-4 text-sm">
                  {errorMsg}
                </div>
              )}
              <div className="mb-6">
                <textarea
                  className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg p-4 min-h-[200px] focus:outline-none focus:ring-2 focus:ring-purple-500 resize-y"
                  placeholder="Por ejemplo: 'Analiza estos datos de ventas y muéstrame las tendencias de los últimos 3 meses' o 'Crea un resumen de las respuestas de los clientes agrupadas por sentimiento'"
                  value={promptText}
                  onChange={(e) => setPromptText(e.target.value)}
                ></textarea>
              </div>
              <div className="flex justify-end">
                <Button 
                  type="button" 
                  disabled={!promptText.trim() || isLoading}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleSubmit}
                >
                  <span>{isLoading ? "Guardando..." : "Siguiente"}</span>
                  <FaArrowRight />
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Instructions */}
          <motion.div
            className="bg-gray-800/50 rounded-lg p-6 border border-gray-700"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="flex items-start">
              <div className="bg-purple-500/20 p-3 rounded-full text-purple-400 mr-4">
                <FaLightbulb size={24} />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-3">Instrucciones</h3>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-start">
                    <span className="text-purple-400 mr-2">•</span>
                    <span>Sé específico sobre qué tipo de análisis necesitas (tendencias, agrupaciones, predicciones, etc.)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-400 mr-2">•</span>
                    <span>Menciona qué columnas de tus datos son más importantes para el análisis</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-400 mr-2">•</span>
                    <span>Si necesitas un formato específico de resultado, indícalo (gráficos, tablas, texto)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-400 mr-2">•</span>
                    <span>Para mejores resultados, especifica cualquier criterio o filtro que quieras aplicar</span>
                  </li>
                </ul>
                
                <div className="mt-4 p-3 bg-gray-700 rounded-lg">
                  <p className="text-sm text-gray-300 font-medium">Ejemplo de prompt efectivo:</p>
                  <p className="text-sm text-gray-400 italic mt-1">
                    &ldquo;Analiza los datos de ventas trimestrales, identifica los 5 productos con mayor crecimiento 
                    en el último año, y muestra las tendencias mes a mes en un formato de gráfico de líneas.&rdquo;
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}