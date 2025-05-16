"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { FaDownload, FaEye, FaShare, FaFile, FaArrowLeft } from "react-icons/fa";
import Link from "next/link";
import Image from "next/image";

import Topbar from "@/components/layout/Topbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";

export default function ResultsPage() {
  const [activeTab, setActiveTab] = useState("preview");
  
  // Datos simulados del resultado
  const resultData = {
    fileName: "Análisis_Ventas_Q1_2025.xlsx",
    fileType: "Excel",
    fileSize: "2.4 MB",
    dateCreated: "16 Mayo, 2025",
    processingTime: "45 segundos",
    modelUsed: "ChatGPT-4"
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
                <p className="text-gray-400">Generado el {resultData.dateCreated} • {resultData.fileSize}</p>
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

          {/* Processing Information */}
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
          
          {/* Content Tabs */}
          <motion.div
            className="mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="border-b border-gray-700">
              <nav className="flex -mb-px">
                <button
                  className={`py-3 px-6 border-b-2 font-medium text-sm ${
                    activeTab === "preview"
                      ? "border-purple-500 text-purple-500"
                      : "border-transparent text-gray-400 hover:text-gray-300"
                  }`}
                  onClick={() => setActiveTab("preview")}
                >
                  <FaEye className="inline mr-2" /> Vista previa
                </button>
                <button
                  className={`py-3 px-6 border-b-2 font-medium text-sm ${
                    activeTab === "details"
                      ? "border-purple-500 text-purple-500"
                      : "border-transparent text-gray-400 hover:text-gray-300"
                  }`}
                  onClick={() => setActiveTab("details")}
                >
                  <FaFile className="inline mr-2" /> Detalles
                </button>
              </nav>
            </div>
          </motion.div>
          
          {/* Tab Content */}
          <motion.div
            className="bg-gray-800 rounded-lg p-6 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {activeTab === "preview" ? (
              <div>
                <div className="bg-gray-700/50 p-4 rounded-lg mb-4 text-center text-gray-400">
                  <p>Vista previa del archivo Excel</p>
                </div>
                
                {/* Excel Preview Mockup */}
                <div className="bg-gray-700 rounded-lg p-4 overflow-auto">
                  <table className="min-w-full divide-y divide-gray-600">
                    <thead>
                      <tr>
                        <th className="px-4 py-3 bg-gray-600 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Producto</th>
                        <th className="px-4 py-3 bg-gray-600 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Q1 2024</th>
                        <th className="px-4 py-3 bg-gray-600 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Q2 2024</th>
                        <th className="px-4 py-3 bg-gray-600 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Q3 2024</th>
                        <th className="px-4 py-3 bg-gray-600 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Q4 2024</th>
                        <th className="px-4 py-3 bg-gray-600 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Crecimiento</th>
                      </tr>
                    </thead>
                    <tbody className="bg-gray-700 divide-y divide-gray-600">
                      <tr>
                        <td className="px-4 py-3 text-sm">SmartHome Hub</td>
                        <td className="px-4 py-3 text-sm">$245K</td>
                        <td className="px-4 py-3 text-sm">$310K</td>
                        <td className="px-4 py-3 text-sm">$380K</td>
                        <td className="px-4 py-3 text-sm">$350K</td>
                        <td className="px-4 py-3 text-sm text-green-500 font-medium">+42.8%</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 text-sm">EcoBlender Pro</td>
                        <td className="px-4 py-3 text-sm">$180K</td>
                        <td className="px-4 py-3 text-sm">$195K</td>
                        <td className="px-4 py-3 text-sm">$230K</td>
                        <td className="px-4 py-3 text-sm">$240K</td>
                        <td className="px-4 py-3 text-sm text-green-500 font-medium">+33.3%</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 text-sm">SoundMax Earbuds</td>
                        <td className="px-4 py-3 text-sm">$320K</td>
                        <td className="px-4 py-3 text-sm">$335K</td>
                        <td className="px-4 py-3 text-sm">$390K</td>
                        <td className="px-4 py-3 text-sm">$410K</td>
                        <td className="px-4 py-3 text-sm text-green-500 font-medium">+28.1%</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 text-sm">CleanAir Purifier</td>
                        <td className="px-4 py-3 text-sm">$150K</td>
                        <td className="px-4 py-3 text-sm">$165K</td>
                        <td className="px-4 py-3 text-sm">$180K</td>
                        <td className="px-4 py-3 text-sm">$185K</td>
                        <td className="px-4 py-3 text-sm text-green-500 font-medium">+23.3%</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 text-sm">FitTrack Watch</td>
                        <td className="px-4 py-3 text-sm">$210K</td>
                        <td className="px-4 py-3 text-sm">$225K</td>
                        <td className="px-4 py-3 text-sm">$240K</td>
                        <td className="px-4 py-3 text-sm">$250K</td>
                        <td className="px-4 py-3 text-sm text-green-500 font-medium">+19.0%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                
                <div className="mt-4 text-gray-400 text-sm">
                  <p>El archivo contiene 3 hojas adicionales con gráficos y análisis detallados.</p>
                </div>
              </div>
            ) : (
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
                      <p className="text-gray-400 text-sm">Creado</p>
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
                      <p>Fila</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Nivel de detalle</p>
                      <p>1.5 (Estándar-Detallado)</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Tiempo de procesamiento</p>
                      <p>{resultData.processingTime}</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Contenido</h3>
                  <ul className="space-y-2 list-disc list-inside text-gray-300">
                    <li>Hoja 1: Resumen de ventas por producto</li>
                    <li>Hoja 2: Análisis de tendencias trimestrales</li>
                    <li>Hoja 3: Proyecciones para Q1 2025</li>
                    <li>Hoja 4: Gráficos comparativos</li>
                  </ul>
                </div>
              </div>
            )}
          </motion.div>
          
          {/* Back to Dashboard */}
          <motion.div
            className="flex justify-between"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Link href="/dashboard">
              <Button variant="outline" className="border-gray-700 hover:bg-gray-800">
                <FaArrowLeft className="mr-2" /> Dashboard
              </Button>
            </Link>
            
            <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
              <FaDownload className="mr-2" /> Descargar archivo
            </Button>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}