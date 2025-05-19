"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { 
  FaArrowRight, 
  FaTable, 
  FaDownload, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaSpinner 
} from "react-icons/fa";
import Topbar from "@/components/layout/Topbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface JobResult {
  job_id: string;
  filename: string;
  modelname: string;
  job_status: string;
  created_at: string;
  completed_at: string | null;
  preview_data?: Array<Record<string, any>>;
  columns?: string[];
}

export default function ResultsPage() {
  const router = useRouter();
  
  // States
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [jobData, setJobData] = useState<JobResult | null>(null);
  const [filePreview, setFilePreview] = useState<Array<Record<string, any>>>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [fileName, setFileName] = useState<string>("");
  const [modelName, setModelName] = useState<string>("");
  const [processedDate, setProcessedDate] = useState<string>("");
  
  // Load data from localStorage on mount
  useEffect(() => {
    function loadDataFromLocalStorage() {
      try {
        // Check authentication
        const token = localStorage.getItem("access_token");
        if (!token) {
          router.push("/login");
          return;
        }
        
        // Get job ID from localStorage
        const jobId = localStorage.getItem("currentJobId");
        if (!jobId) {
          setErrorMsg("No job ID found. Please start a new analysis.");
          setIsLoading(false);
          return;
        }
        
        // Get file info
        const filename = localStorage.getItem("processedFilename") || "processed-file";
        const modelname = localStorage.getItem("processedModelName") || "AI Model";
        const timestamp = localStorage.getItem("processedTimestamp") || new Date().toISOString();
        
        // Create job data object
        const jobData: JobResult = {
          job_id: jobId,
          filename: filename,
          modelname: modelname,
          job_status: "finished",
          created_at: timestamp,
          completed_at: timestamp
        };
        
        setJobData(jobData);
        setFileName(filename);
        setModelName(modelname);
        setProcessedDate(timestamp);
        
        // Load preview data
        const previewDataString = localStorage.getItem("previewData");
        const columnsString = localStorage.getItem("previewColumns");
        
        if (previewDataString) {
          try {
            const previewData = JSON.parse(previewDataString);
            setFilePreview(Array.isArray(previewData) ? previewData : [{ message: "Invalid preview data format" }]);
          } catch (e) {
            setFilePreview([{ message: "Could not parse preview data" }]);
          }
        } else {
          setFilePreview([{ message: "No preview data available" }]);
        }
        
        if (columnsString) {
          try {
            const columnsData = JSON.parse(columnsString);
            setColumns(Array.isArray(columnsData) ? columnsData : ['message']);
          } catch (e) {
            setColumns(['message']);
          }
        } else {
          setColumns(['message']);
        }
      } catch (error) {
        console.error("Failed to load data:", error);
        setErrorMsg(error instanceof Error ? error.message : "Could not load results");
      } finally {
        setIsLoading(false);
      }
    }
    
    loadDataFromLocalStorage();
  }, [router]);
  
  // Download file function
  const handleDownload = async () => {
    if (!jobData?.job_id) return;
    
    try {
      const token = localStorage.getItem("access_token");
      const downloadUrl = `/api/job/download?job_id=${jobData.job_id}`;
      
      // Create a hidden link and trigger download
      const link = document.createElement('a');
      
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
      const objectUrl = URL.createObjectURL(blob);
      
      link.href = objectUrl;
      link.download = `processed_${jobData.filename || 'file'}`;
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      setTimeout(() => {
        URL.revokeObjectURL(objectUrl);
        document.body.removeChild(link);
      }, 1000);
      
    } catch (error) {
      console.error("Download failed:", error);
      setErrorMsg(`Failed to download file: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString();
  };
  
  // Render table cell with proper formatting
  const renderCell = (value: any) => {
    if (value === null || value === undefined) return "—";
    
    if (typeof value === 'object') {
      try {
        return JSON.stringify(value).slice(0, 100) + (JSON.stringify(value).length > 100 ? '...' : '');
      } catch {
        return String(value);
      }
    }
    
    return String(value);
  };
  
  return (
    <div className="min-h-screen w-full bg-gray-900 text-white flex flex-col">
      <Topbar />
      
      <main className="flex-grow pt-20 px-6 md:px-10 lg:px-16">
        <div className="max-w-6xl mx-auto py-8">
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
              Analysis Results
            </h1>
            <p className="text-gray-400 mt-2 max-w-xl mx-auto">
              Your file has been processed successfully. Here's a preview of the results.
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
              <p className="text-gray-400">Loading results...</p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Job Info Card */}
              {jobData && (
                <motion.div 
                  className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl overflow-hidden shadow-xl border border-gray-700"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="p-6 border-b border-gray-700">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-semibold flex items-center">
                        <FaCheckCircle className="text-green-400 mr-2" />
                        File Processed Successfully
                      </h2>
                      <div className="flex items-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium 
                          ${jobData.job_status === 'finished' ? 'bg-green-500/20 text-green-400' : 
                          jobData.job_status === 'processing' ? 'bg-blue-500/20 text-blue-400' : 
                          'bg-yellow-500/20 text-yellow-400'}`}>
                          {jobData.job_status === 'finished' ? 'Completed' : 
                           jobData.job_status === 'processing' ? 'Processing' : 
                           'Pending'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <p className="text-gray-400 text-sm mb-1">File Name</p>
                      <p className="font-medium">{fileName || jobData?.filename || "Processed file"}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Model Used</p>
                      <p className="font-medium">{modelName || jobData?.modelname || "AI Model"}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Processed On</p>
                      <p className="font-medium">{formatDate(processedDate || jobData?.completed_at || jobData?.created_at || new Date().toISOString())}</p>
                    </div>
                  </div>
                  
                  <div className="px-6 pb-6">
                    <Button 
                      className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium flex items-center gap-2"
                      onClick={handleDownload}
                    >
                      <FaDownload />
                      <span>Download Full Results</span>
                    </Button>
                  </div>
                </motion.div>
              )}
              
              {/* Data Preview */}
              <motion.div
                className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl overflow-hidden shadow-xl border border-gray-700"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                <div className="p-6 border-b border-gray-700">
                  <h2 className="text-xl font-semibold flex items-center">
                    <FaTable className="text-blue-400 mr-2" />
                    Data Preview (First 10 Rows)
                  </h2>
                </div>
                
                <div className="p-4 overflow-auto">
                  {filePreview.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      <FaSpinner className="animate-spin mx-auto mb-4 text-2xl" />
                      <p>Loading preview data...</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-full border-collapse">
                        <thead>
                          <tr className="bg-gray-800">
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider border-b border-gray-700">
                              #
                            </th>
                            {columns.map((column, index) => (
                              <th 
                                key={index} 
                                className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider border-b border-gray-700"
                              >
                                {column}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                          {filePreview.map((row, rowIndex) => (
                            <tr key={rowIndex} className="hover:bg-gray-800/50">
                              <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-300">
                                {rowIndex + 1}
                              </td>
                              {columns.map((column, colIndex) => (
                                <td 
                                  key={`${rowIndex}-${colIndex}`} 
                                  className="px-4 py-3 whitespace-nowrap text-sm text-gray-300"
                                >
                                  {renderCell(row[column])}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </motion.div>
              
              {/* Navigation Buttons */}
              <motion.div 
                className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <Button 
                  variant="outline" 
                  className="bg-transparent border-gray-600 hover:bg-gray-800 text-gray-300"
                  onClick={() => router.push("/")}
                >
                  Start New Analysis
                </Button>
                
                <Button
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 font-semibold flex items-center gap-2"
                  onClick={() => router.push("/")}
                >
                  <span>Start New Analysis</span>
                  <FaArrowRight />
                </Button>
              </motion.div>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}