"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaArrowRight, FaInfoCircle, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { useRouter } from "next/navigation";
import Image from "next/image";

import Topbar from "@/components/layout/Topbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";

interface EstimateResponse {
  job_id: string;
  filename: string;
  modelname: string;
  verbosity: number;
  granularity: string;
  estimated_input_tokens: number;
  estimated_output_tokens: number;
  cost_per_1m_input: number;
  cost_per_1m_output: number;
  handling_fee: number;
  estimated_cost: number;
  job_status: string;
  created_at: string;
  completed_at: string | null;
}

export default function ConfirmationPage() {
  const router = useRouter();
  
  // Estados para almacenar los datos seleccionados y la respuesta del backend
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [estimateData, setEstimateData] = useState<EstimateResponse | null>(null);
  
  // Datos cargados desde localStorage
  const [selectedData, setSelectedData] = useState({
    modelId: "",
    modelName: "",
    promptId: "",
    mediaId: "",
    filename: "",
    detailLevel: 1,
    operationMode: "PER_ROW",
    maxRows: 100
  });

  // Cargar los datos seleccionados en pasos anteriores y obtener estimación
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("access_token");
      if (!token) {
        router.push("/login");
        return false;
      }
      return true;
    };

    const loadSelectedData = () => {
      // Recuperar datos de localStorage
      const modelId = localStorage.getItem("currentModelId") || "";
      const promptId = localStorage.getItem("currentPromptId") || "";
      const mediaId = localStorage.getItem("currentMediaId") || "";
      const detailLevel = parseFloat(localStorage.getItem("detailLevel") || "1");
      const operationMode = localStorage.getItem("operationMode") || "PER_ROW";
      const maxRows = parseInt(localStorage.getItem("maxRows") || "100");
      
      // También vamos a necesitar recuperar el nombre del modelo y archivo
      // para mostrarlo en la UI (en una implementación real obtendríamos estos
      // datos del backend, pero para simplificar usaremos marcadores de posición)
      const filename = localStorage.getItem("currentFileName") || "Archivo cargado";
      
      setSelectedData({
        modelId,
        modelName: "Modelo seleccionado", // Se actualizará desde la respuesta del backend
        promptId,
        mediaId,
        filename,
        detailLevel,
        operationMode,
        maxRows
      });
      
      // Verificar que tengamos todos los datos necesarios
      if (!modelId || !promptId || !mediaId) {
        setErrorMsg("Faltan datos de selección. Por favor, completa los pasos anteriores.");
        setIsLoading(false);
        return false;
      }
      
      return true;
    };
    
    const fetchEstimate = async () => {
      if (!checkAuth() || !loadSelectedData()) return;
      
      try {
        setIsLoading(true);
        setErrorMsg("");
        
        // Crear FormData para la petición
        const formData = new FormData();
        formData.append("prompt_id", selectedData.promptId);
        formData.append("media_id", selectedData.mediaId);
        formData.append("model_id", selectedData.modelId);
        formData.append("focus_column", ""); // Columna focal (opcional)
        
        // Convertir detailLevel a granularidad (verbosidad será el detailLevel)
        // PER_ROW o PER_CELL viene desde el operationMode
        
        // Calcular parámetros basados en el nivel de detalle
        const verbosity = selectedData.detailLevel;
        
        // Llamar a la API para estimar el trabajo
        const apiUrl = "/api/job/estimate";
        
        const token = localStorage.getItem("access_token");
        
        // Parámetros de consulta
        const queryParams = new URLSearchParams({
          granularity: selectedData.operationMode,
          verbosity: verbosity.toString(),
          chunk_size: selectedData.maxRows.toString()
        });
        
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
        
        const data = await res.json();
        console.log("Respuesta de estimación:", data);
        
        // Actualizar el estado con los datos de la respuesta
        setEstimateData(data);
        
        // Actualizar el nombre del modelo con el recibido del backend
        setSelectedData(prev => ({
          ...prev,
          modelName: data.modelname,
          filename: data.filename
        }));
      } catch (error) {
        console.error("Error al obtener estimación:", error);
        setErrorMsg(error instanceof Error ? error.message : "Error al conectar con el servidor");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchEstimate();
  }, [router]);

  const handleCancel = () => {
    // Redirigir a la página de selección de modelo
    router.push("/model");
  };

  const formatCurrency = (cents: number) => {
    // Convertir centavos a pesos
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

          {errorMsg && (
            <motion.div
              className="bg-red-600/80 text-white p-4 rounded-lg mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {errorMsg}
            </motion.div>
          )}

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
                    <p className="font-medium">{selectedData.filename}</p>
                    <p className="text-sm text-gray-400">{estimateData?.filename || ""}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Modelo seleccionado</p>
                    <p className="font-medium">{estimateData?.modelname || selectedData.modelName}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-400 text-sm">Nivel de detalle</p>
                    <p className="font-medium">{selectedData.detailLevel.toFixed(1)} (Estándar-Detallado)</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Modo de operación</p>
                    <p className="font-medium">{selectedData.operationMode === "PER_ROW" ? "Fila" : "Celda"}</p>
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
                      <p className="font-medium text-gray-300">
                        {estimateData?.estimated_input_tokens.toLocaleString() || "Calculando..."} tokens
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Costo de entrada</p>
                      <p className="font-medium text-gray-300">
                        {estimateData ? formatCurrency(
                          (estimateData.estimated_input_tokens * estimateData.cost_per_1m_input) / 1000000
                        ) : "Calculando..."}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Tokens de salida</p>
                      <p className="font-medium text-gray-300">
                        {estimateData?.estimated_output_tokens.toLocaleString() || "Calculando..."} tokens
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Costo de salida</p>
                      <p className="font-medium text-gray-300">
                        {estimateData ? formatCurrency(
                          (estimateData.estimated_output_tokens * estimateData.cost_per_1m_output) / 1000000
                        ) : "Calculando..."}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between">
                    <div>
                      <p className="text-base md:text-lg font-semibold">
                        Costo total: <span className="text-purple-400">
                          {estimateData ? formatCurrency(estimateData.estimated_cost) : "Calculando..."}
                        </span>
                      </p>
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
                
                <Button 
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 w-full md:w-auto"
                  onClick={() => {
                    if (estimateData) {
                      // Guardar el job_id para referencia futura
                      localStorage.setItem("currentJobId", estimateData.job_id);
                      router.push("/processing");
                    } else {
                      setErrorMsg("No se pudo calcular el costo. Inténtalo de nuevo.");
                    }
                  }}
                  disabled={!estimateData}
                >
                  <FaCheckCircle className="mr-2" />
                  <span>Confirmar y procesar</span>
                  <FaArrowRight />
                </Button>
              </motion.div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}