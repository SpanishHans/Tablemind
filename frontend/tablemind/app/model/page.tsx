"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { FaArrowRight, FaCog } from "react-icons/fa";
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

export default function ModelPage() {
  const router = useRouter();
  
  // States
  const [models, setModels] = useState<Model[]>([]);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [verbosity, setVerbosity] = useState<number>(0.2);
  const [granularity, setGranularity] = useState<string>("PER_ROW");
  const [chunkSize, setChunkSize] = useState<number>(10);
  
  // UI states
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [progress, setProgress] = useState(0);
  const [progressStage, setProgressStage] = useState("");
  
  // Provider colors for UI
  const providerColors = {
    "Google": "bg-blue-500",
    "OpenAI": "bg-green-500",
    "Anthropic": "bg-purple-500",
    "Meta": "bg-blue-600",
    "Mistral": "bg-yellow-500",
    "DeepSeek": "bg-red-500"
  };
  
  // Load models on mount
  useEffect(() => {
    async function loadModels() {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          router.push("/login");
          return;
        }
        
        const response = await fetch("/api/model/fetch/all", {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        setModels(data);
        
        // Auto-select first active model
        const activeModels = data.filter(m => m.is_active);
        if (activeModels.length > 0) {
          setSelectedModel(activeModels[0].model_id);
        }
      } catch (error) {
        console.error("Failed to load models:", error);
        setErrorMsg("Could not load models. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }
    
    loadModels();
  }, [router]);
  
  // Handle form submission
  const handleSubmit = async () => {
    if (!selectedModel || isSubmitting) return;
    
    // Get necessary data from localStorage
    const promptId = localStorage.getItem("currentPromptId");
    const mediaId = localStorage.getItem("currentMediaId");
    
    // Validate data
    if (!promptId || promptId === "undefined" || promptId === "null") {
      setErrorMsg("Please select a prompt first");
      return;
    }
    
    if (!mediaId || mediaId === "undefined" || mediaId === "null") {
      setErrorMsg("Please upload a file first");
      return;
    }
    
    // Start submission process
    setIsSubmitting(true);
    setErrorMsg("");
    setProgressStage("Starting estimation...");
    setProgress(10);
    
    // Save current parameters to localStorage
    localStorage.setItem("currentModelId", selectedModel);
    localStorage.setItem("verbosity", verbosity.toString());
    localStorage.setItem("granularity", granularity);
    localStorage.setItem("chunkSize", chunkSize.toString());
    
    // Setup progress animation
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) return 90;
        return prev + 5;
      });
    }, 500);
    
    const stageInterval = setInterval(() => {
      setProgress(p => {
        if (p < 30) setProgressStage("Preparing request...");
        else if (p < 50) setProgressStage("Calculating input tokens...");
        else if (p < 70) setProgressStage("Calculating output tokens...");
        else setProgressStage("Estimating costs...");
        return p;
      });
    }, 1000);
    
    try {
      // Prepare form data
      const formData = new FormData();
      formData.append("prompt_id", promptId);
      formData.append("media_id", mediaId);
      formData.append("model_id", selectedModel);
      
      // Prepare query parameters
      const queryParams = new URLSearchParams({
        granularity: granularity,
        verbosity: verbosity.toFixed(1),
        chunk_size: chunkSize.toString()
      });
      
      // Call the API
      const token = localStorage.getItem("access_token");
      const response = await fetch(`/api/job/estimate?${queryParams.toString()}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData
      });
      
      // Clear intervals
      clearInterval(progressInterval);
      clearInterval(stageInterval);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }
      
      // Parse response
      const data = await response.json();
      
      // Store individual items from the response in localStorage
      localStorage.setItem("jobEstimateData", JSON.stringify(data)); // Keep this for backward compatibility
      
      // Store each field separately
      if (data.filename) localStorage.setItem("estimateFilename", data.filename);
      if (data.modelname) localStorage.setItem("estimateModelname", data.modelname);
      if (data.verbosity) localStorage.setItem("estimateVerbosity", data.verbosity.toString());
      if (data.granularity) localStorage.setItem("estimateGranularity", data.granularity);
      if (data.estimated_input_tokens) localStorage.setItem("estimateInputTokens", data.estimated_input_tokens.toString());
      if (data.estimated_output_tokens) localStorage.setItem("estimateOutputTokens", data.estimated_output_tokens.toString());
      if (data.cost_per_1m_input) localStorage.setItem("estimateCostPerInputM", data.cost_per_1m_input.toString());
      if (data.cost_per_1m_output) localStorage.setItem("estimateCostPerOutputM", data.cost_per_1m_output.toString());
      if (data.handling_fee) localStorage.setItem("estimateHandlingFee", data.handling_fee.toString());
      if (data.estimated_cost) localStorage.setItem("estimateTotalCost", data.estimated_cost.toString());
      if (data.job_id) localStorage.setItem("estimateJobId", data.job_id.toString());
      
      // Complete progress and redirect
      setProgress(100);
      setProgressStage("Complete! Redirecting...");
      
      // Navigate to confirmation page
      setTimeout(() => {
        router.push("/confirmation");
      }, 500);
      
    } catch (error) {
      clearInterval(progressInterval);
      clearInterval(stageInterval);
      console.error("Error:", error);
      setErrorMsg(error instanceof Error ? error.message : "An unknown error occurred");
      setIsSubmitting(false);
      setProgress(0);
    }
  };
  
  return (
    <div className="min-h-screen w-full bg-gray-900 text-white flex flex-col">
      <Topbar />
      
      <main className="flex-grow pt-20 px-6 md:px-10 lg:px-16">
        <div className="max-w-4xl mx-auto py-8">
          {/* Header */}
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
          
          {/* Models */}
          <div>
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
            
            {/* Settings */}
            <div className="bg-gray-800 rounded-lg p-6 mb-8">
              <div className="flex items-center mb-4">
                <FaCog className="text-purple-400 mr-2" />
                <h2 className="text-xl font-semibold">Analysis Configuration</h2>
              </div>
              
              {/* Verbosity Slider */}
              <div className="mb-6">
                <label className="block text-gray-300 mb-2">
                  Verbosity Level: <span className="font-medium">{verbosity.toFixed(1)}</span>
                </label>
                <input
                  type="range"
                  min="0.2"
                  max="2"
                  step="0.1"
                  value={verbosity}
                  onChange={(e) => setVerbosity(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>Minimal</span>
                  <span>Balanced</span>
                  <span>Verbose</span>
                </div>
              </div>
              
              {/* Granularity Dropdown */}
              <div className="mb-6">
                <label className="block text-gray-300 mb-2">Granularity</label>
                <select
                  value={granularity}
                  onChange={(e) => setGranularity(e.target.value)}
                  className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="PER_ROW">Per Row</option>
                  <option value="PER_CELL" disabled>Per Cell (Disabled)</option>
                </select>
                <p className="text-xs text-gray-400 mt-1">
                  Processes data by rows (faster for horizontal data)
                </p>
              </div>
              
              {/* Chunk Size Input */}
              <div>
                <label className="block text-gray-300 mb-2">Chunk Size (Rows per Request)</label>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={chunkSize}
                  onChange={(e) => setChunkSize(parseInt(e.target.value))}
                  className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Number of rows processed in each chunk (recommended: 10-100)
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
          
          {/* Loading Overlay */}
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
                  <p className="text-gray-300">{progressStage}</p>
                </div>
                
                {/* Progress bar */}
                <div className="w-full bg-gray-700 rounded-full h-4 mb-4">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-4 rounded-full"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                
                <div className="flex justify-between text-sm text-gray-400">
                  <span>{progress}%</span>
                  <span>Please wait...</span>
                </div>
                
                {/* Cancel button */}
                {progress < 90 && (
                  <button
                    className="mt-6 w-full py-2 px-4 border border-gray-600 rounded-md text-gray-300 hover:bg-gray-700 transition-colors"
                    onClick={() => {
                      setIsSubmitting(false);
                      setProgress(0);
                    }}
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