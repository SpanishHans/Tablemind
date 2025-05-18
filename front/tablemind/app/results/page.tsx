"use client";
import { motion } from "framer-motion";
import { FaDownload, FaShare, FaFileExcel } from "react-icons/fa";
import Image from "next/image";

import Topbar from "@/components/layout/Topbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";

export default function ResultsPage() {
  // Datos ficticios de resultado (esto se reemplazaría con datos reales del backend)
  const resultData = {
    fileName: "Análisis_Ventas_Q1_2025.xlsx",
    fileType: "Excel (.xlsx)",
    fileSize: "2.4 MB",
    modelUsed: "ChatGPT-4",
    detailLevel: "1.5 (Estándar-Detallado)",
    operationMode: "Fila",
    dateCreated: "16 Mayo, 2025",
    processingTime: "45 segundos",
    mediaId: "Análisis_Ventas_Q1_2025_1718547893642"
  };

  return (
    <div className="min-h-screen w-full bg-gray-900 text-white flex flex-col">
      <Topbar />
      
      <main className="flex-grow pt-20 px-6 md:px-10 lg:px-16">
        <div className="max-w-5xl mx-auto py-8">
          {/* Header with Logo and File Info */}
          <motion.div 
            className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center">
              <div className="mr-4 relative w-12 h-12">
                <Image 
                  src="/images/logo.jpeg" 
                  alt="TableMind Logo" 
                  fill
                  sizes="(max-width: 768px) 24px, 48px"
                  className="object-contain" 
                />
              </div>
              <div>
                <h1 className="text-3xl font-bold">{resultData.fileName}</h1>
                <p className="text-gray-400">Procesado el {resultData.dateCreated}</p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button variant="outline" className="border-gray-700 hover:bg-gray-800">
                <FaShare className="mr-2" /> Compartir
              </Button>
              <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                <FaDownload className="mr-2" /> Descargar
              </Button>
            </div>
          </motion.div>

          {/* Processing Status */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
              <p className="text-gray-400 text-sm">Modelo utilizado</p>
              <p className="font-semibold text-lg">{resultData.modelUsed}</p>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
              <p className="text-gray-400 text-sm">Tiempo de procesamiento</p>
              <p className="font-semibold text-lg">{resultData.processingTime}</p>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
              <p className="text-gray-400 text-sm">Estado</p>
              <p className="font-semibold text-lg text-green-500">Completado</p>
            </div>
          </motion.div>
          
          {/* File Summary */}
          <motion.div
            className="bg-gray-800 rounded-lg p-6 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="flex items-center mb-6">
              <div className="bg-blue-500/20 p-4 rounded-lg mr-4">
                <FaFileExcel className="text-4xl text-blue-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold mb-1">{resultData.fileName}</h2>
                <p className="text-gray-400">{resultData.fileType} • {resultData.fileSize}</p>
              </div>
            </div>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2">Información del archivo</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-400 text-sm">Nombre del archivo</p>
                    <p>{resultData.fileName}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Tipo</p>
                    <p>{resultData.fileType}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Tamaño</p>
                    <p>{resultData.fileSize}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Fecha de creación</p>
                    <p>{resultData.dateCreated}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Parámetros del análisis</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-400 text-sm">Modelo</p>
                    <p>{resultData.modelUsed}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Modo de operación</p>
                    <p>{resultData.operationMode}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Nivel de detalle</p>
                    <p>{resultData.detailLevel}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Tiempo de procesamiento</p>
                    <p>{resultData.processingTime}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
          
          {/* Success Message Box */}
          <motion.div
            className="bg-green-500/10 border border-green-500/30 rounded-lg p-5 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="flex items-center mb-3">
              <div className="bg-green-500/20 p-2 rounded-full mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-green-500">Archivo procesado correctamente</h3>
            </div>
            <p className="text-gray-300 ml-11">
              El archivo se ha procesado con éxito y está listo para ser descargado. 
              Pulsa el botón &quot;Descargar&quot; para obtener tu análisis.
            </p>
          </motion.div>
          
          {/* Download Button */}
          <motion.div
            className="flex justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Button 
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 px-8 py-3 text-lg"
            >
              <FaDownload className="mr-3 text-xl" /> Descargar archivo
            </Button>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}