
"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { FaArrowRight, FaLightbulb } from "react-icons/fa";
import Link from "next/link";

import Topbar from "@/components/layout/Topbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";

export default function PromptPage() {
  const [promptText, setPromptText] = useState("");

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
              <div className="w-20 h-20">
                <img src="/images/logo.jpeg" alt="TableMind Logo" className="w-full h-full" />
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
              <div className="mb-6">
                <textarea
                  className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg p-4 min-h-[200px] focus:outline-none focus:ring-2 focus:ring-purple-500 resize-y"
                  placeholder="Por ejemplo: &apos;Analiza estos datos de ventas y muéstrame las tendencias de los últimos 3 meses&apos; o &apos;Crea un resumen de las respuestas de los clientes agrupadas por sentimiento&apos;"
                  value={promptText}
                  onChange={(e) => setPromptText(e.target.value)}
                ></textarea>
              </div>
              <div className="flex justify-end">
                <Link href="/model-select">
                  <Button 
                    type="button" 
                    disabled={!promptText.trim()}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={(e) => {
                      if (!promptText.trim()) {
                        e.preventDefault();
                      } else {
                        console.log("Prompt submitted:", promptText);
                      }
                    }}
                  >
                    <span>Siguiente</span>
                    <FaArrowRight />
                  </Button>
                </Link>
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