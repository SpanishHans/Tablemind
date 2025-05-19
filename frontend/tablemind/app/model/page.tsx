"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaArrowRight, FaCog } from "react-icons/fa";
import { useRouter } from "next/navigation";
import Image from "next/image";

import Topbar from "@/components/layout/Topbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";

// Model interface
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
  
  // Model selection states
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [detailLevel, setDetailLevel] = useState<number>(1);
  const [operationMode, setOperationMode] = useState<string>("PER_ROW");
  const [maxRows, setMaxRows] = useState<number>(100);
  
  // UI states
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [models, setModels] = useState<Model[]>([]);
  
  // Loading states
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingStage, setLoadingStage] = useState("");

  // Provider colors for UI
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

  // Load models on component mount
  useEffect(() => {
    loadModels();
  }, [router]);

  // Function to fetch available models
  const loadModels = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      router.push("/login");
      return;
    }
    
    setCheckingAuth(false);
    setIsLoading(true);
    setErrorMsg("");
    
    try {
      const response = await fetch("/api/model/fetch/all", {
        method: "GET",
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `Error ${response.status}: ${response.statusText}`;
        
        try {
          const errorData = JSON.parse(errorText);
          if (errorData.detail) errorMessage = errorData.detail;
        } catch {}
        
        throw new Error(errorMessage);
      }
      
      const modelsData = await response.json();
      setModels(modelsData);
      
      // Auto-select first active model
      if (modelsData && modelsData.length > 0) {
        const activeModels = modelsData.filter((model: Model) => model.is_active);
        if (activeModels.length > 0) {
          setSelectedModel(activeModels[0].model_id);
        }
      }
    } catch (error) {
      console.error("Error loading models:", error);
      setErrorMsg(error instanceof Error ? error.message : "Error loading models");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle form submission
  const handleSubmit = () => {
    if (!selectedModel || isSubmitting) return;
    
    // Start loading state
    setIsSubmitting(true);
    setErrorMsg("");
    setLoadingStage("Starting estimation...");
    setLoadingProgress(10);
    
    // Save parameters to localStorage
    localStorage.setItem("currentModelId", selectedModel);
    localStorage.setItem("detailLevel", detailLevel.toString());
    localStorage.setItem("operationMode", operationMode);
    localStorage.setItem("maxRows", maxRows.toString());
    
    // Create a simulated loading animation
    const progressInterval = setInterval(() => {
      setLoadingProgress(prev => {
        const newProgress = prev + 5;
        if (newProgress >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return newProgress;
      });
    }, 800);
    
    // Update status messages based on progress
    const statusInterval = setInterval(() => {
      const currentProgress = loadingProgress;
      if (currentProgress < 30) {
        setLoadingStage("Preparing request...");
      } else if (currentProgress < 50) {
        setLoadingStage("Calculating input tokens...");
      } else if (currentProgress < 70) {
        setLoadingStage("Calculating output tokens...");
      } else {
        setLoadingStage("Estimating costs...");
      }
    }, 1000);
    
    // Simulate an API response after delay
    setTimeout(() => {
      // Clear intervals
      clearInterval(progressInterval);
      clearInterval(statusInterval);
      
      // Create fake estimate data
      const estimateData = {
        filename: "example_file.xlsx",
        modelname: "GPT-4",
        verbosity: detailLevel,
        granularity: operationMode,
        estimated_input_tokens: 12500,
        estimated_output_tokens: 6800,
        cost_per_1m_input: 10,
        cost_per_1m_output: 30,
        handling_fee: 5,
        estimated_cost: 35,
        job_id: "12345-mock-job-id",
        job_status: "pending",
        created_at: new Date().toISOString(),
        completed_at: null
      };
      
      // Save mock data to localStorage
      localStorage.setItem("jobEstimateData", JSON.stringify(estimateData));
      
      // Complete the loading
      setLoadingProgress(100);
      setLoadingStage("Completed! Redirecting...");
      
      // Navigate to confirmation page
      setTimeout(() => {
        router.push("/confirmation");
      }, 800);
    }, 3000);
  };
  
    // Cancel estimation
    const handleCancel = () => {
      setIsSubmitting(false);
      setErrorMsg("Estimation cancelled by user");
      setLoadingProgress(0);
      setLoadingStage("Cancelled");
    };

  // Auth loading screen
  if (checkingAuth) {
    return (
      <div className="min-h-screen w-full bg-gray-900 text-white flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        <p className="mt-4 text-gray-400">Verifying credentials...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gray-900 text-white flex flex-col">
      <Topbar />
      
      <main className="flex-grow pt-20 px-6 md:px-10 lg:px-16">
        <div className="max-w-4xl mx-auto py-8">
          {/* Header with Logo */}
          <div className="mb-10 text-center">
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
            <h1 className="text-3xl font-bold">Select a Model</h1>
            <p className="text-gray-400 mt-2">Choose an AI model and configure parameters for your analysis</p>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="bg-red-600/80 text-white p-4 rounded-lg mb-6">
              {errorMsg}
            </div>
          )}

          <div>
            {/* AI Model Selection */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Available Models</h2>
              
              {isLoading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-500"></div>
                  <p className="ml-3 text-gray-400">Loading models...</p>
                </div>
              ) : models.length === 0 ? (
                <div className="bg-gray-800/50 rounded-lg p-6 text-center">
                  <p className="text-gray-400">No models available. Please contact your administrator.</p>
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
                        {!model.is_active ? "Not available" : 
                          selectedModel === model.model_id ? "Selected" : 
                          `Provider: ${model.provider}`}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Settings Section */}
            <div className="bg-gray-800 rounded-lg p-6 mb-8">
              <div className="flex items-center mb-4">
                <FaCog className="text-purple-400 mr-2" />
                <h2 className="text-xl font-semibold">Analysis Configuration</h2>
              </div>

              {/* Detail Level Slider */}
              <div className="mb-6">
                <label className="block text-gray-300 mb-2">
                  Detail Level: <span className="font-medium">{detailLevel.toFixed(1)}</span>
                </label>
                <input
                  type="range"
                  min="0.2"
                  max="2"
                  step="0.1"
                  value={detailLevel}
                  onChange={(e) => setDetailLevel(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>Basic</span>
                  <span>Standard</span>
                  <span>Detailed</span>
                </div>
              </div>

              {/* Operation Mode Dropdown */}
              <div className="mb-6">
                <label className="block text-gray-300 mb-2">Operation Mode</label>
                <select
                  value={operationMode}
                  onChange={(e) => setOperationMode(e.target.value)}
                  className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="PER_ROW">Row</option>
                  <option value="PER_CELL">Cell</option>
                </select>
                <p className="text-xs text-gray-400 mt-1">
                  {operationMode === "PER_ROW" 
                    ? "Processes data by rows (faster for horizontal data)" 
                    : "Processes data by cells (more efficient for vertically structured data)"}
                </p>
              </div>

              {/* Max Rows Input */}
              <div>
                <label className="block text-gray-300 mb-2">Maximum Rows to Process</label>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={maxRows}
                  onChange={(e) => setMaxRows(parseInt(e.target.value))}
                  className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Limits the number of rows that will be processed (recommended value: 100)
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <Button 
                type="button" 
                disabled={!selectedModel || isSubmitting || isLoading}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleSubmit}
              >
                {isSubmitting ? (
                  <>
                    <span className="animate-spin h-5 w-5 mr-2 border-t-2 border-b-2 border-white rounded-full" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <span>Next</span>
                    <FaArrowRight />
                  </>
                )}
              </Button>
            </div>
          </div>
          
          {/* Loading Overlay - Show when submitting */}
          {isSubmitting && (
            <div className="fixed inset-0 bg-black/70 z-50 flex flex-col items-center justify-center">
              <div className="bg-gray-800 p-8 rounded-lg shadow-lg max-w-md w-full">
                <div className="text-center mb-6">
                  <div className="w-20 h-20 mx-auto relative mb-4">
                    <Image
                      src="/images/logo.jpeg"
                      alt="TableMind Logo"
                      fill
                      sizes="80px"
                      className="object-contain" 
                    />
                  </div>
                  <h2 className="text-xl font-bold text-white mb-2">Calculating Costs</h2>
                  <p className="text-gray-300">{loadingStage}</p>
                </div>
                
                {/* Progress bar */}
                <div className="w-full bg-gray-700 rounded-full h-4 mb-4">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-4 rounded-full"
                    style={{ width: `${loadingProgress}%` }}
                  ></div>
                </div>
                
                <div className="flex justify-between text-sm text-gray-400">
                  <span>{loadingProgress}%</span>
                  <span>Please wait...</span>
                </div>
                
                {/* Cancel button */}
                {loadingProgress < 90 && (
                  <button
                    className="mt-6 w-full py-2 px-4 border border-gray-600 rounded-md text-gray-300 hover:bg-gray-700 transition-colors"
                    onClick={handleCancel}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}