"use client";
import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { FaCloudUploadAlt, FaFileAlt, FaArrowRight, FaTimesCircle } from "react-icons/fa";
import Link from "next/link";

import Topbar from "@/components/layout/Topbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";

export default function LoadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [mediaId, setMediaId] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const isValidFileType = (file: File) => {
    const validTypes = [
      'text/csv', 
      'application/vnd.ms-excel', 
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    const validExtensions = ['.csv', '.xls', '.xlsx'];
    
    // Comprueba el tipo MIME
    if (validTypes.includes(file.type)) return true;
    
    // Comprueba la extensión del archivo
    return validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if (isValidFileType(droppedFile)) {
        setFile(droppedFile);
        generateMediaId(droppedFile.name);
      } else {
        alert("Por favor, sube un archivo Excel (.xlsx, .xls) o CSV (.csv)");
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      if (isValidFileType(selectedFile)) {
        setFile(selectedFile);
        generateMediaId(selectedFile.name);
      } else {
        alert("Por favor, sube un archivo Excel (.xlsx, .xls) o CSV (.csv)");
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setMediaId("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const generateMediaId = (fileName: string) => {
    // Generar un ID único basado en el nombre del archivo y la fecha actual
    const timestamp = new Date().getTime();
    const cleanFileName = fileName.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9]/g, "_");
    const newMediaId = `${cleanFileName}_${timestamp}`;
    setMediaId(newMediaId);
    
    // Almacenar el mediaId en localStorage
    localStorage.setItem("currentMediaId", newMediaId);
  };

  const handleClickUpload = () => {
    fileInputRef.current?.click();
  };

  const getFileIcon = () => {
    if (!file) return null;
    
    if (file.name.toLowerCase().endsWith('.csv')) {
      return <FaFileAlt className="text-4xl text-green-500 mr-3" />;
    } else {
      return <FaFileAlt className="text-4xl text-blue-500 mr-3" />;
    }
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
              <div className="w-20 h-20">
                <img src="/images/logo.jpeg" alt="TableMind Logo" className="w-full h-full" />
              </div>
            </div>
            <h1 className="text-3xl font-bold">Carga tu archivo</h1>
            <p className="text-gray-400 mt-2">Arrastra y suelta tu archivo Excel o CSV, o selecciónalo desde tu dispositivo</p>
          </motion.div>

          {/* Upload Area */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div 
              className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[300px]
              ${isDragging ? "border-purple-500 bg-purple-500/10" : "border-gray-600 hover:border-gray-500 bg-gray-800/50"}
              ${file ? "border-green-500 bg-green-500/10" : ""}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={file ? undefined : handleClickUpload}
            >
              {!file ? (
                <>
                  <FaCloudUploadAlt className="text-5xl text-gray-400 mb-4" />
                  <h3 className="text-xl font-medium mb-2">Arrastra tu archivo Excel o CSV aquí</h3>
                  <p className="text-gray-400 mb-6">o</p>
                  <Button 
                    variant="outline" 
                    className="border-gray-600 hover:bg-gray-700"
                    onClick={handleClickUpload}
                  >
                    Seleccionar archivo
                  </Button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".csv,.xls,.xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv"
                    className="hidden"
                  />
                </>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="flex items-center mb-4">
                    {getFileIcon()}
                    <div className="text-left">
                      <p className="font-medium">{file.name}</p>
                      <p className="text-sm text-gray-400">{(file.size / 1024).toFixed(2)} KB</p>
                    </div>
                    <button 
                      className="ml-4 text-gray-400 hover:text-red-500 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFile();
                      }}
                    >
                      <FaTimesCircle size={20} />
                    </button>
                  </div>
                  <p className="text-green-500 mb-2">Archivo listo para procesar</p>
                  <p className="text-xs text-gray-400">ID: {mediaId}</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Format Information */}
          <motion.div
            className="bg-gray-800 rounded-lg p-6 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h3 className="text-lg font-medium mb-4">Formatos soportados</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-700 rounded-lg p-4">
                <h4 className="font-medium mb-2">Excel (.xlsx)</h4>
                <p className="text-sm text-gray-400">Formato Excel moderno</p>
              </div>
              <div className="bg-gray-700 rounded-lg p-4">
                <h4 className="font-medium mb-2">Excel (.xls)</h4>
                <p className="text-sm text-gray-400">Formato Excel tradicional</p>
              </div>
              <div className="bg-gray-700 rounded-lg p-4">
                <h4 className="font-medium mb-2">CSV (.csv)</h4>
                <p className="text-sm text-gray-400">Valores separados por comas</p>
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-400">
              <p>Asegúrate de que tu archivo tenga encabezados en la primera fila para un mejor análisis.</p>
            </div>
            <div className="mt-2 text-sm text-gray-400">
              <p>Tamaño máximo: 10MB por archivo</p>
            </div>
          </motion.div>

          {/* Submit Button */}
          <motion.div
            className="flex justify-end"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Link href="/confirmation">
              <Button 
                type="button" 
                disabled={!file}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>Procesar</span>
                <FaArrowRight />
              </Button>
            </Link>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}