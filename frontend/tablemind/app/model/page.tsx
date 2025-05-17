"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaArrowRight, FaCog } from "react-icons/fa";
import { useRouter } from "next/navigation";
import Image from "next/image";

import Topbar from "@/components/layout/Topbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";

// Tipo para los modelos cargados desde el backend
interface Model {
  model_id: string;
  name: string;
  provider: string;
  is_active: boolean;
  cost_per_1m_input?: number;
  cost_per_1m_output?: number;
  max_input_tokens?: number;
  max_output_tokens?: number;
}

export default function ModelSelectPage() {
  const router = useRouter();
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [detailLevel, setDetailLevel] = useState<number>(1);
  const [operationMode, setOperationMode] = useState<string>("PER_ROW");
  const [maxRows, setMaxRows] = useState<number>(100);
  const [isLoading, setIsLoading] = useState(true);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [models, setModels] = useState<Model[]>([]);

  // Colores para los diferentes proveedores
  const providerColors: Record<string, string> = {
    "Google": "bg-blue-500",
    "OpenAI": "bg-green-500",
    "Anthropic": "bg-purple-500",
    "Meta": "bg-blue-600",
    "Cohere": "bg-red-500",
    "Mistral": "bg-yellow-500",
    "DeepSeek": "bg-red-500",
    "NVIDIA": "bg-green-600",
    "Grok": "bg-blue-600"
  };

  // Verificar autenticación al cargar el componente
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("access_token");
      if (!token) {
        // Redireccionar al login si no hay token
        router.push("/login");
        return;
      }
      
      setCheckingAuth(false);
      
      try {
        // Cargar los modelos disponibles
        const apiUrl = "/api/model/fetch/all";
        const res = await fetch(apiUrl, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });

        if (!res.ok) {
          try {
            const errorData = await res.json();
            setErrorMsg(errorData.detail || `Error ${res.status}: ${res.statusText}`);
          } catch {
            setErrorMsg(`Error ${res.status}: ${res.statusText}`);
          }
          setIsLoading(false);
          return;
        }

        const modelsData = await res.json();
        console.log("Modelos cargados:", modelsData);
        setModels(modelsData);
        
        // Si hay modelos disponibles, seleccionar el primero por defecto
        if (modelsData && modelsData.length > 0) {
          const activeModels = modelsData.filter((model: Model) => model.is_active);
          if (activeModels.length > 0) {
            setSelectedModel(activeModels[0].model_id);
          }
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error("Error al cargar los modelos:", error);
        setErrorMsg("Error de conexión al cargar los modelos");
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, [router]);

  // Manejar la selección del modelo
  const handleSubmit = () => {
    if (!selectedModel) return;
    
    try {
      // Guardar los parámetros seleccionados en localStorage
      localStorage.setItem("currentModelId", selectedModel);
      localStorage.setItem("detailLevel", detailLevel.toString());
      localStorage.setItem("operationMode", operationMode);
      localStorage.setItem("maxRows", maxRows.toString());
      
      console.log("Parámetros guardados:", {
        modelId: selectedModel,
        detailLevel,
        operationMode,
        maxRows
      });
      
      // Navegar a la siguiente página
      router.push("/confirmation");
    } catch (error) {
      console.error("Error al guardar parámetros:", error);
      setErrorMsg("Error al guardar la configuración");
    }
  };

  // Si está comprobando autenticación, mostrar pantalla de carga
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
                  className="object-contain"
                  priority
                />
              </div>
            </div>
            <h1 className="text-3xl font-bold">Selecciona un modelo</h1>
            <p className="text-gray-400 mt-2">Elige el modelo de IA y configura los parámetros para tu análisis</p>
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

          <div>
            {/* AI Model Selection */}
            <motion.div
              className="mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <h2 className="text-xl font-semibold mb-4">Modelos disponibles</h2>
              
              {isLoading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-500"></div>
                  <p className="ml-3 text-gray-400">Cargando modelos...</p>
                </div>
              ) : models.length === 0 ? (
                <div className="bg-gray-800/50 rounded-lg p-6 text-center">
                  <p className="text-gray-400">No hay modelos disponibles. Por favor, contacta con el administrador.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {models.map((model) => (
                    <div
                      key={model.model_id}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedModel === model.model_id
                          ? "border-purple-500 bg-gray-800"
                          : "border-gray-700 bg-gray-800/50 hover:border-gray-500"
                      } ${!model.is_active ? "opacity-50 cursor-not-allowed" : ""}`}
                      onClick={() => model.is_active && setSelectedModel(model.model_id)}
                    >
                      <div className={`w-12 h-12 rounded-full ${providerColors[model.provider] || "bg-gray-600"} mb-3 flex items-center justify-center`}>
                        <span className="text-white font-bold text-lg">
                          {model.name.charAt(0)}
                        </span>
                      </div>
                      <h3 className="font-medium">{model.name}</h3>
                      <p className="text-xs text-gray-400 mt-1">
                        {!model.is_active ? "No disponible" : 
                          selectedModel === model.model_id ? "Seleccionado" : 
                          `Proveedor: ${model.provider}`}
                      </p>
                    </div>
                  ))}
                </div>
              )}
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
                  Nivel de detalle: <span className="font-medium">{detailLevel.toFixed(1)}</span>
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
              <div className="mb-6">
                <label className="block text-gray-300 mb-2">Modo de operación</label>
                <select
                  value={operationMode}
                  onChange={(e) => setOperationMode(e.target.value)}
                  className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="PER_ROW">Fila</option>
                  <option value="PER_CELL">Celda</option>
                </select>
                <p className="text-xs text-gray-400 mt-1">
                  {operationMode === "PER_ROW" 
                    ? "Procesa los datos por filas (más rápido para datos horizontales)" 
                    : "Procesa los datos por celdas (más eficiente para datos estructurados verticalmente)"}
                </p>
              </div>

              {/* Max Rows Input */}
              <div>
                <label className="block text-gray-300 mb-2">Máximo de filas a procesar</label>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={maxRows}
                  onChange={(e) => setMaxRows(parseInt(e.target.value))}
                  className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Limita la cantidad de filas que se procesarán (valor recomendado: 100)
                </p>
              </div>
            </motion.div>

            {/* Submit Button */}
            <motion.div
              className="flex justify-end"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Button 
                type="button" 
                disabled={!selectedModel || isLoading}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleSubmit}
              >
                <span>Siguiente</span>
                <FaArrowRight />
              </Button>
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}