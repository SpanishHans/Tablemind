"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { 
  FaArrowRight, 
  FaInfoCircle, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaFileAlt, 
  FaRobot, 
  FaCoins, 
  FaDownload 
} from "react-icons/fa";
import Topbar from "@/components/layout/Topbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

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
  
  // States
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [progress, setProgress] = useState(0);
  const [progressStage, setProgressStage] = useState("");
  const [downloadReady, setDownloadReady] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const [filePreview, setFilePreview] = useState<Array<Record<string, any>>>([]);
  const [columns, setColumns] = useState<string[]>([]);
  
  // Data loaded from localStorage
  const [selectedData, setSelectedData] = useState({
    modelId: "",
    modelName: "",
    promptId: "",
    mediaId: "",
    filename: "",
    verbosity: 1,
    granularity: "PER_ROW",
    chunkSize: 10,
    inputTokens: 0,
    outputTokens: 0,
    costPerInputM: 0,
    costPerOutputM: 0,
    handlingFee: 0,
    totalCost: 0
  });

  // Load data selected in previous steps
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
      try {
        // Retrieve data from localStorage
        const modelId = localStorage.getItem("currentModelId") || "";
        const promptId = localStorage.getItem("currentPromptId") || "";
        const mediaId = localStorage.getItem("currentMediaId") || "";
        
        // Retrieve parameters
        const verbosity = parseFloat(localStorage.getItem("verbosity") || "1");
        const granularity = localStorage.getItem("granularity") || "PER_ROW";
        const chunkSize = parseInt(localStorage.getItem("chunkSize") || "10");
        
        // Retrieve estimate data
        const filename = localStorage.getItem("estimateFilename") || localStorage.getItem("currentFileName") || "Uploaded file";
        const modelName = localStorage.getItem("estimateModelname") || "Selected model";
        const inputTokens = parseInt(localStorage.getItem("estimateInputTokens") || "0");
        const outputTokens = parseInt(localStorage.getItem("estimateOutputTokens") || "0");
        const costPerInputM = parseFloat(localStorage.getItem("estimateCostPerInputM") || "0");
        const costPerOutputM = parseFloat(localStorage.getItem("estimateCostPerOutputM") || "0");
        const handlingFee = parseFloat(localStorage.getItem("estimateHandlingFee") || "0");
        const totalCost = parseFloat(localStorage.getItem("estimateTotalCost") || "0");
        
        // Validate required fields
        if (!modelId || !promptId || !mediaId) {
          setErrorMsg("Missing required parameters. Please start over from the beginning.");
          setIsLoading(false);
          return false;
        }
        
        setSelectedData({
          modelId,
          modelName,
          promptId,
          mediaId,
          filename,
          verbosity,
          granularity,
          chunkSize,
          inputTokens,
          outputTokens,
          costPerInputM,
          costPerOutputM,
          handlingFee,
          totalCost
        });
        
        return true;
      } catch (error) {
        console.error("Error loading data:", error);
        setErrorMsg("Failed to load configuration data. Please try again.");
        setIsLoading(false);
        return false;
      }
    };
    
    // Initialize page
    if (checkAuth() && loadSelectedData()) {
      setIsLoading(false);
    }
  }, [router]);
  
  // Handle form submission
  const handleSubmit = async () => {
    if (isSubmitting) return;
    
    // Start job
    setIsSubmitting(true);
    setErrorMsg("");
    setProgressStage("Starting job...");
    setProgress(10);
    
    // Setup progress animation
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) return 90;
        return prev + 5;
      });
    }, 500);
    
    const stageInterval = setInterval(() => {
      setProgress(p => {
        if (p < 30) setProgressStage("Preparing your data...");
        else if (p < 50) setProgressStage("Setting up the model...");
        else if (p < 70) setProgressStage("Processing your request...");
        else setProgressStage("Creating your file...");
        return p;
      });
    }, 1000);
    
    try {
      // Prepare form data for API call
      const formData = new FormData();
      formData.append("prompt_id", selectedData.promptId);
      formData.append("media_id", selectedData.mediaId);
      formData.append("model_id", selectedData.modelId);
      formData.append("focus_column", ""); // Optional focus column
      
      // Prepare query parameters
      const queryParams = new URLSearchParams({
        granularity: selectedData.granularity,
        verbosity: selectedData.verbosity.toFixed(1),
        chunk_size: selectedData.chunkSize.toString()
      });
      
      // Call the API to start the job
      const token = localStorage.getItem("access_token");
      const response = await fetch(`/api/job/start?${queryParams.toString()}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to create job: ${errorText}`);
      }
      
      // Parse response to get job ID
      const data = await response.json();
      const newJobId = data.job_id;
      
      if (!newJobId) {
        throw new Error("No job ID returned from server");
      }
      
      // Save job ID
      setJobId(newJobId);
      localStorage.setItem("currentJobId", newJobId);
      
      // Update progress
      setProgress(95);
      setProgressStage("Job created successfully! Preparing download...");
      
      // Clear intervals
      clearInterval(progressInterval);
      clearInterval(stageInterval);
      
      // Complete progress
      setProgress(100);
      setDownloadReady(true);
      
      // Trigger download after a short delay
      setTimeout(() => {
        if (newJobId) downloadFile(newJobId);
      }, 1500);
      
    } catch (error) {
      // Clear intervals
      clearInterval(progressInterval);
      clearInterval(stageInterval);
      
      console.error("Error creating job:", error);
      setErrorMsg(error instanceof Error ? error.message : "An unknown error occurred");
      setIsSubmitting(false);
      setProgress(0);
    }
  };
  
  // Handle file download
  const downloadFile = async (id: string) => {
    try {
      setProgressStage("Starting download...");
      
      // Create download URL
      const token = localStorage.getItem("access_token");
      const downloadUrl = `/api/job/download?job_id=${id}`;
      
      // Create a hidden link and trigger download
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `processed_${selectedData.filename}`;
      
      // Set authorization header by making a fetch request and using blob
      const response = await fetch(downloadUrl, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Download failed: ${response.statusText}`);
      }
      
      const blob = await response.blob();
      
      // Try to parse the file to get preview data
      try {
        const text = await blob.text();
        let data = [];
        
        // Simple CSV parser (this is a basic implementation)
        if (selectedData.filename.toLowerCase().endsWith('.csv')) {
          const lines = text.split('\n');
          if (lines.length > 0) {
            const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
            setColumns(headers);
            localStorage.setItem("previewColumns", JSON.stringify(headers));
            
            const previewRows = lines.slice(1, Math.min(11, lines.length));
            data = previewRows.map(line => {
              const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
              const row: { [key: string]: string } = {};
              headers.forEach((header, i) => {
                row[header] = values[i] || '';
              });
              return row;
            });
            localStorage.setItem("previewData", JSON.stringify(data));
          }
        }
        // JSON parser
        else if (selectedData.filename.toLowerCase().endsWith('.json')) {
          const jsonData = JSON.parse(text);
          if (Array.isArray(jsonData) && jsonData.length > 0) {
            data = jsonData.slice(0, 10);
            const headers = Object.keys(jsonData[0]);
            setColumns(headers);
            localStorage.setItem("previewColumns", JSON.stringify(headers));
            localStorage.setItem("previewData", JSON.stringify(data));
          }
        }
        // Excel parser
        else if (selectedData.filename.toLowerCase().match(/\.(xlsx|xls|xlsm)$/)) {
          try {
            // For Excel files, we need to extract data from the response differently
            // The backend should already have converted this to a readable format (CSV or JSON)
            
            // Try to parse as CSV
            const lines = text.split('\n');
            if (lines.length > 0) {
              const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
              
              if (headers.length > 1) {
                setColumns(headers);
                localStorage.setItem("previewColumns", JSON.stringify(headers));
                
                const previewRows = lines.slice(1, Math.min(11, lines.length));
                data = previewRows.map(line => {
                  const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
                  const row: { [key: string]: string } = {};
                  headers.forEach((header, i) => {
                    row[header] = values[i] || '';
                  });
                  return row;
                });
                localStorage.setItem("previewData", JSON.stringify(data));
              } else {
                // Try to parse as JSON as fallback
                try {
                  const jsonData = JSON.parse(text);
                  if (Array.isArray(jsonData) && jsonData.length > 0) {
                    data = jsonData.slice(0, 10);
                    const headers = Object.keys(jsonData[0]);
                    setColumns(headers);
                    localStorage.setItem("previewColumns", JSON.stringify(headers));
                    localStorage.setItem("previewData", JSON.stringify(data));
                  }
                } catch (innerError) {
                  throw new Error("Could not parse Excel file data");
                }
              }
            }
          } catch (error) {
            console.error("Excel parsing error:", error);
            data = [{ message: "Could not parse Excel file. The backend should convert Excel to a readable format." }];
            setColumns(['message']);
            localStorage.setItem("previewData", JSON.stringify(data));
            localStorage.setItem("previewColumns", JSON.stringify(['message']));
          }
        }
        // Other formats
        else {
          // For other formats, we'll just show a basic preview
          data = [{ message: "Preview not available for this file format" }];
          setColumns(['message']);
          localStorage.setItem("previewData", JSON.stringify(data));
          localStorage.setItem("previewColumns", JSON.stringify(['message']));
        }
        
        setFilePreview(data);
      } catch (error) {
        console.error("Failed to parse file for preview:", error);
        const fallbackData = [{ message: "Could not generate preview" }];
        localStorage.setItem("previewData", JSON.stringify(fallbackData));
        localStorage.setItem("previewColumns", JSON.stringify(['message']));
        setFilePreview(fallbackData);
        setColumns(['message']);
      }
      
      const objectUrl = URL.createObjectURL(blob);
      
      link.href = objectUrl;
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      setTimeout(() => {
        URL.revokeObjectURL(objectUrl);
        document.body.removeChild(link);
        
        // Also store file info in localStorage
        localStorage.setItem("processedFilename", selectedData.filename);
        localStorage.setItem("processedModelName", selectedData.modelName);
        localStorage.setItem("processedTimestamp", new Date().toISOString());
        
        // Navigate to results page after download starts
        router.push("/results");
      }, 1000);
      
    } catch (error) {
      console.error("Download failed:", error);
      setErrorMsg(`Failed to download file: ${error instanceof Error ? error.message : "Unknown error"}`);
      // Keep the UI in download ready state so user can try again
    }
  };
  
  // Format currency for display
  const formatCurrency = (value: number) => {
    // Return value in US cents
    return `${value.toFixed(2)}¢`;
  };
  
  // Format number with commas
  const formatNumber = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };
  
  // Stylized card for confirmation details
  const DetailCard = ({ icon, title, value, color = "blue" }) => (
    <motion.div 
      className={`bg-gray-800/70 backdrop-blur-sm p-4 rounded-xl border border-gray-700 shadow-lg`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-start space-x-3">
        <div className={`p-2 rounded-lg bg-opacity-20 text-${color}-400 bg-${color}-900`}>
          {icon}
        </div>
        <div>
          <h3 className="text-gray-400 text-sm">{title}</h3>
          <p className="text-white font-medium mt-1">{value}</p>
        </div>
      </div>
    </motion.div>
  );
  
  // Main render
  return (
    <div className="min-h-screen w-full bg-gray-900 text-white flex flex-col">
      <Topbar />
      
      <main className="flex-grow pt-20 px-6 md:px-10 lg:px-16">
        <div className="max-w-4xl mx-auto py-8">
          {/* Header Section */}
          <motion.div 
            className="text-center mb-10"
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
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Confirm Your Analysis
            </h1>
            <p className="text-gray-400 mt-2 max-w-xl mx-auto">
              Review your estimated costs and configuration before proceeding with the analysis
            </p>
          </motion.div>
          
          {/* Error Message */}
          {errorMsg && (
            <motion.div 
              className="bg-red-600/80 text-white p-4 rounded-lg mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center">
                <FaTimesCircle className="mr-2" />
                <span>{errorMsg}</span>
              </div>
            </motion.div>
          )}
          
          {/* Loading State */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mb-4"></div>
              <p className="text-gray-400">Loading estimate data...</p>
            </div>
          ) : (
            <>
              {/* Summary Card */}
              <motion.div 
                className="mb-8 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl overflow-hidden shadow-xl"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
              >
                <div className="p-6 border-b border-gray-700">
                  <h2 className="text-xl font-semibold flex items-center">
                    <FaCheckCircle className="text-green-400 mr-2" />
                    Analysis Summary
                  </h2>
                </div>
                
                <div className="p-6">
                  {/* File and Model Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <DetailCard 
                      icon={<FaFileAlt size={18} />} 
                      title="File" 
                      value={selectedData.filename}
                      color="blue" 
                    />
                    <DetailCard 
                      icon={<FaRobot size={18} />} 
                      title="Model" 
                      value={selectedData.modelName}
                      color="purple" 
                    />
                  </div>
                  
                  {/* Configuration Details */}
                  <div className="bg-gray-800/50 rounded-xl p-5 mb-8">
                    <h3 className="text-lg font-medium mb-4 flex items-center">
                      <FaInfoCircle className="text-blue-400 mr-2" />
                      Configuration
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex flex-col">
                        <span className="text-gray-400">Verbosity</span>
                        <span className="font-medium">{selectedData.verbosity.toFixed(1)}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-gray-400">Granularity</span>
                        <span className="font-medium">
                          {selectedData.granularity === "PER_ROW" ? "Per Row" : "Per Cell"}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-gray-400">Chunk Size</span>
                        <span className="font-medium">{selectedData.chunkSize} rows</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Cost Breakdown */}
                  <div className="bg-gray-800/50 rounded-xl p-5 mb-6">
                    <h3 className="text-lg font-medium mb-4 flex items-center">
                      <FaCoins className="text-yellow-400 mr-2" />
                      Estimated Costs
                    </h3>
                    
                    <div className="space-y-3 mb-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Input Tokens</span>
                        <span className="font-medium">{formatNumber(selectedData.inputTokens)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Output Tokens (estimated)</span>
                        <span className="font-medium">{formatNumber(selectedData.outputTokens)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Input Cost (US cents per 1M tokens)</span>
                        <span className="font-medium">{selectedData.costPerInputM.toFixed(0)}¢</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Output Cost (US cents per 1M tokens)</span>
                        <span className="font-medium">{selectedData.costPerOutputM.toFixed(0)}¢</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Handling Fee (US cents)</span>
                        <span className="font-medium">{selectedData.handlingFee.toFixed(0)}¢</span>
                      </div>
                      <div className="h-px bg-gray-700 my-2"></div>
                      <div className="flex justify-between items-center text-lg">
                        <span className="font-medium">Total Estimated Cost (US cents)</span>
                        <span className="font-bold text-green-400">{selectedData.totalCost.toFixed(0)}¢</span>
                      </div>
                    </div>
                    
                    <div className="text-xs text-gray-500 mt-2">
                      * Actual costs may vary slightly based on final processing
                    </div>
                  </div>
                </div>
              </motion.div>
              
              {/* Action Buttons */}
              <motion.div 
                className="flex flex-col sm:flex-row justify-between space-y-4 sm:space-y-0 sm:space-x-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Button 
                  type="button"
                  variant="outline" 
                  className="bg-transparent border-gray-600 hover:bg-gray-800 text-gray-300"
                  onClick={() => router.push("/model")}
                >
                  Back to Model Selection
                </Button>
                
                <Button
                  type="button" 
                  disabled={isSubmitting || isLoading}
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
                      <span>Process & Download</span>
                      <FaArrowRight />
                    </>
                  )}
                </Button>
              </motion.div>
            </>
          )}
          
          {/* Processing/Download Overlay */}
          {isSubmitting && (
            <div className="fixed inset-0 bg-black/70 z-50 flex flex-col items-center justify-center backdrop-blur-sm">
              <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl max-w-md w-full border border-gray-700">
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
                  
                  {downloadReady ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <h2 className="text-xl font-bold text-white mb-2">Analysis Complete!</h2>
                      <p className="text-gray-300 mb-6">Your file has been processed successfully.</p>
                      
                      <div className="flex justify-center mb-4">
                        <div className="bg-green-500/20 rounded-full p-4">
                          <FaCheckCircle className="text-green-400 text-4xl" />
                        </div>
                      </div>
                      
                      <p className="text-gray-300">Your download should start automatically.</p>
                      <p className="text-gray-400 text-sm mt-1">If it doesn't, click the button below. You'll be redirected to the results preview after downloading.</p>
                      
                      <Button
                        className="mt-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white w-full py-3 flex items-center justify-center gap-2"
                        onClick={() => jobId && downloadFile(jobId)}
                      >
                        <FaDownload className="mr-1" />
                        Download File
                      </Button>
                    </motion.div>
                  ) : (
                    <div>
                      <h2 className="text-xl font-bold text-white mb-2">Processing Your Analysis</h2>
                      <p className="text-gray-300">{progressStage}</p>
                      
                      {/* Progress bar */}
                      <div className="w-full bg-gray-700 rounded-full h-4 mb-4 mt-6 overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-purple-600 h-4 rounded-full transition-all duration-300 ease-out"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                      
                      <div className="flex justify-between text-sm text-gray-400">
                        <span>{progress}%</span>
                        <span>Please wait...</span>
                      </div>
                      
                      {/* Cancel button */}
                      {progress < 90 && !downloadReady && (
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
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}