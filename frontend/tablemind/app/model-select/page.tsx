"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { FaArrowRight, FaCog } from "react-icons/fa";
import Link from "next/link";

import Topbar from "@/components/layout/Topbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";

export default function ModelSelectPage() {
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [detailLevel, setDetailLevel] = useState<number>(1);
  const [operationMode, setOperationMode] = useState<string>("fila");

  const models = [
    { id: "gemini", name: "Google Gemini", color: "bg-blue-500" },
    { id: "gpt4", name: "ChatGPT-4", color: "bg-green-500" },
    { id: "claude", name: "Claude", color: "bg-purple-500" },
    { id: "deepseek", name: "DeepSeek", color: "bg-red-500" },
    { id: "nvidia", name: "Nvidia AI", color: "bg-green-600" },
    { id: "grok", name: "Grok", color: "bg-blue-600" },
  ];

  return (
    <div className="min-h-screen w-full bg-gray-900 text-white flex flex-col">
      <Topbar />
      
      <main className="flex-grow pt-20 px-6 md:px-10 lg:px-16">
        <div className="max-w-4xl mx-auto py-8">
          {/* Header with Logo */}
          <motion.div 
            className="mb-10 text-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20">
                <img src="/images/logo.jpeg" alt="TableMind Logo" className="w-full h-full" />
              </div>
            </div>
            <h1 className="text-3xl font-bold">Selecciona un modelo</h1>
            <p className="text-gray-400 mt-2">Elige el modelo de IA y configura los parámetros para tu análisis</p>
          </motion.div>

          <div>
            {/* AI Model Selection */}
            <motion.div
              className="mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <h2 className="text-xl font-semibold mb-4">Modelos disponibles</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {models.map((model) => (
                  <div
                    key={model.id}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedModel === model.id
                        ? "border-purple-500 bg-gray-800"
                        : "border-gray-700 bg-gray-800/50 hover:border-gray-500"
                    }`}
                    onClick={() => setSelectedModel(model.id)}
                  >
                    <div className={`w-12 h-12 rounded-full ${model.color} mb-3 flex items-center justify-center`}>
                      {/* Placeholder for logo - you can replace with actual logos */}
                      <span className="text-white font-bold text-lg">
                        {model.name.charAt(0)}
                      </span>
                    </div>
                    <h3 className="font-medium">{model.name}</h3>
                    <p className="text-xs text-gray-400 mt-1">
                      {selectedModel === model.id && "Seleccionado"}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Settings Section */}
            <motion.div
              className="bg-gray-800 rounded-lg p-6 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="flex items-center mb-4">
                <FaCog className="text-purple-400 mr-2" />
                <h2 className="text-xl font-semibold">Configuración del análisis</h2>
              </div>

              {/* Detail Level Slider */}
              <div className="mb-6">
                <label className="block text-gray-300 mb-2">
                  Nivel de detalle: <span className="font-medium">{detailLevel}</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={detailLevel}
                  onChange={(e) => setDetailLevel(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>Básico</span>
                  <span>Estándar</span>
                  <span>Detallado</span>
                </div>
              </div>

              {/* Operation Mode Dropdown */}
              <div>
                <label className="block text-gray-300 mb-2">Modo de operación</label>
                <select
                  value={operationMode}
                  onChange={(e) => setOperationMode(e.target.value)}
                  className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="fila">Fila</option>
                  <option value="columna">Columna</option>
                </select>
                <p className="text-xs text-gray-400 mt-1">
                  {operationMode === "fila" 
                    ? "Procesa los datos por filas (más rápido para datos horizontales)" 
                    : "Procesa los datos por columnas (más eficiente para datos verticales)"}
                </p>
              </div>
            </motion.div>

            {/* Advanced Options */}
            <motion.div
              className="mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <details className="group text-left">
                <summary className="flex items-center cursor-pointer">
                  <span className="font-medium">Opciones avanzadas</span>
                  <svg className="ml-2 h-5 w-5 transform transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="mt-4 pl-4 border-l-2 border-gray-700">
                  <div className="mb-4">
                    <label className="block text-gray-300 mb-2">Máximo de filas a procesar</label>
                    <input
                      type="number"
                      className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="100"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 mb-2">Formato de salida</label>
                    <select
                      className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      defaultValue="auto"
                    >
                      <option value="auto">Auto</option>
                      <option value="table">Tabla</option>
                      <option value="graph">Gráfico</option>
                      <option value="text">Texto</option>
                    </select>
                  </div>
                </div>
              </details>
            </motion.div>

            {/* Submit Button */}
            <motion.div
              className="flex justify-end"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Link href="/processing">
                <Button 
                  type="button" 
                  disabled={!selectedModel}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={(e) => {
                    if (!selectedModel) {
                      e.preventDefault();
                    } else {
                      // Aquí podrías guardar los parámetros seleccionados si es necesario
                      console.log("Analysis parameters:", { selectedModel, detailLevel, operationMode });
                    }
                  }}
                >
                  <span>Siguiente</span>
                  <FaArrowRight />
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}