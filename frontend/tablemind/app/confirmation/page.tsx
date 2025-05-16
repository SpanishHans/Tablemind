"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaArrowRight, FaInfoCircle, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";

import Topbar from "@/components/layout/Topbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";

export default function ConfirmationPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  
  // Datos ficticios que vendrían del backend
  const [costData] = useState({
    inputTokens: 1240,
    outputTokens: 850,
    inputCost: 62, // centavos
    outputCost: 85, // centavos
    userType: "Básico",
    totalCost: 147, // centavos
    fileName: "Datos_Ventas_Q1_2025.xlsx",
    fileSize: "2.4 MB",
    model: "ChatGPT-4",
    detailLevel: "1.5",
    operationMode: "Fila",
  });

  // Simular carga de datos del backend
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);

  const handleCancel = () => {
    // Aquí se podría hacer una llamada al backend para borrar lo seleccionado
    
    // Limpiar localStorage si es necesario
    localStorage.removeItem("currentMediaId");
    
    // Redireccionar a la página prompt
    router.push("/prompt");
  };

  const formatCurrency = (cents: number) => {
    const pesos = cents / 100;
    return `$${pesos.toFixed(2)} COP`;
  };

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
            <h1 className="text-3xl font-bold">Confirmar procesamiento</h1>
            <p className="text-gray-400 mt-2">Revisa los detalles y costos antes de continuar</p>
          </motion.div>

          {isLoading ? (
            <motion.div
              className="flex justify-center items-center py-20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mb-4"></div>
                <p className="text-gray-300">Calculando costos de procesamiento...</p>
              </div>
            </motion.div>
          ) : (
            <>
              {/* File and Parameters Section */}
              <motion.div
                className="bg-gray-800 rounded-lg p-6 mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <h2 className="text-xl font-semibold mb-4">Resumen de la solicitud</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                  <div>
                    <p className="text-gray-400 text-sm">Archivo</p>
                    <p className="font-medium">{costData.fileName}</p>
                    <p className="text-sm text-gray-400">{costData.fileSize}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Modelo seleccionado</p>
                    <p className="font-medium">{costData.model}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-400 text-sm">Nivel de detalle</p>
                    <p className="font-medium">{costData.detailLevel} (Estándar-Detallado)</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Modo de operación</p>
                    <p className="font-medium">{costData.operationMode}</p>
                  </div>
                </div>
              </motion.div>

              {/* Cost Details Section */}
              <motion.div
                className="bg-gray-800 rounded-lg p-6 mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className="flex items-center mb-4">
                  <FaInfoCircle className="text-blue-400 mr-2" size={20} />
                  <h2 className="text-xl font-semibold">Detalles de costo</h2>
                </div>
                
                <div className="border-b border-gray-700 pb-4 mb-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
                    <div>
                      <p className="text-gray-400 text-sm">Tokens de entrada</p>
                      <p className="font-medium text-gray-300">{costData.inputTokens.toLocaleString()} tokens</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Costo de entrada</p>
                      <p className="font-medium text-gray-300">{formatCurrency(costData.inputCost)}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Tokens de salida</p>
                      <p className="font-medium text-gray-300">{costData.outputTokens.toLocaleString()} tokens</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Costo de salida</p>
                      <p className="font-medium text-gray-300">{formatCurrency(costData.outputCost)}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between">
                    <div>
                      <p className="text-gray-300 text-sm mb-1">Tipo de usuario: <span className="font-medium">{costData.userType}</span></p>
                      <p className="text-base md:text-lg font-semibold">Costo total: <span className="text-purple-400">{formatCurrency(costData.totalCost)}</span></p>
                    </div>
                    
                    <div className="mt-4 md:mt-0 bg-blue-500/10 p-3 rounded-lg border border-blue-500/30">
                      <p className="text-sm text-blue-300 flex items-center">
                        <FaInfoCircle className="mr-2" />
                        <span>El costo se deducirá de tu saldo disponible</span>
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Action Buttons */}
              <motion.div
                className="flex flex-col-reverse md:flex-row justify-between gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Button 
                  variant="outline" 
                  className="border-gray-700 hover:bg-gray-800 flex items-center justify-center"
                  onClick={handleCancel}
                >
                  <FaTimesCircle className="mr-2" /> 
                  Cancelar y volver
                </Button>
                
                <Link href="/processing">
                  <Button 
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 w-full md:w-auto"
                  >
                    <FaCheckCircle className="mr-2" />
                    <span>Confirmar y procesar</span>
                    <FaArrowRight />
                  </Button>
                </Link>
              </motion.div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}