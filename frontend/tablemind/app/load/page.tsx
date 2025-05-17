"use client";
import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FaCloudUploadAlt,
  FaFileAlt,
  FaArrowRight,
  FaTimesCircle,
  FaSpinner,
} from "react-icons/fa";
import { useRouter } from "next/navigation";
import Image from "next/image";

import Topbar from "@/components/layout/Topbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";

export default function LoadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [checkingAuth, setCheckingAuth] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Verificar autenticación al cargar el componente
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("access_token");
      if (!token) {
        // Redireccionar al login si no hay token
        router.push("/login");
      } else {
        setCheckingAuth(false);
      }
    };

    checkAuth();
  }, [router]);

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
      "text/csv",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.oasis.opendocument.spreadsheet", // Para archivos .ods
    ];
    const validExtensions = [".csv", ".xls", ".xlsx", ".ods", ".tsv"];

    // Comprueba el tipo MIME
    if (validTypes.includes(file.type)) return true;

    // Comprueba la extensión del archivo
    return validExtensions.some((ext) => file.name.toLowerCase().endsWith(ext));
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if (isValidFileType(droppedFile)) {
        setFile(droppedFile);
      } else {
        setErrorMsg(
          "Por favor, sube un archivo Excel (.xlsx, .xls), OpenDocument (.ods), CSV (.csv) o TSV (.tsv)",
        );
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      if (isValidFileType(selectedFile)) {
        setFile(selectedFile);
        setErrorMsg("");
      } else {
        setErrorMsg(
          "Por favor, sube un archivo Excel (.xlsx, .xls), OpenDocument (.ods), CSV (.csv) o TSV (.tsv)",
        );
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setErrorMsg("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClickUpload = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async () => {
    if (!file) {
      return;
    }

    try {
      setIsLoading(true);
      setErrorMsg("");

      // Crear el FormData para enviar el archivo
      const formData = new FormData();
      formData.append("file", file);

      // Usar el proxy API configurado en next.config.js
      const apiUrl = "/api/media/upload/tabular";

      console.log("Intentando subir archivo:", file.name);
      console.log(
        "Token de autorización presente:",
        !!localStorage.getItem("access_token"),
      );

      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error(
          "No hay token de autenticación. Inicia sesión de nuevo.",
        );
      }

      const res = await fetch(apiUrl, {
        method: "POST",
        body: formData,
        // No incluimos credentials: "include" si ya estamos enviando el token en headers
        headers: {
          Authorization: `Bearer ${token}`,
          // No establecemos Content-Type ya que el navegador lo hará automáticamente con el boundary correcto para FormData
        },
      });

      // Verificar si la respuesta fue exitosa antes de intentar parsear JSON
      if (!res.ok) {
        // Intentar obtener detalles del error si está disponible como JSON
        try {
          const errorData = await res.json();
          throw new Error(
            errorData.detail || `Error ${res.status}: ${res.statusText}`,
          );
        } catch {
          // Si no se puede parsear como JSON, usar el mensaje de estado HTTP
          throw new Error(`Error ${res.status}: ${res.statusText}`);
        }
      }

      const data = await res.json();
      console.log("Respuesta del servidor:", data);

      // Guardar el media_id en localStorage para usarlo en confirmación
      localStorage.setItem("currentMediaId", data.id);

      // Simular éxito para prueba mientras se arregla el backend
      // QUITAR CUANDO EL BACKEND ESTÉ FUNCIONANDO CORRECTAMENTE
      // localStorage.setItem("currentMediaId", "test-media-id-123");

      // Redirigir al usuario a la página de confirmación
      router.push("/model");
    } catch (error) {
      console.error("Error al subir archivo:", error);
      setErrorMsg(
        error instanceof Error
          ? error.message
          : "Error de conexión con el servidor. Inténtalo de nuevo.",
      );
      setIsLoading(false);
    }
  };

  const getFileIcon = () => {
    if (!file) return null;

    if (
      file.name.toLowerCase().endsWith(".csv") ||
      file.name.toLowerCase().endsWith(".tsv")
    ) {
      return <FaFileAlt className="text-4xl text-green-500 mr-3" />;
    } else {
      return <FaFileAlt className="text-4xl text-blue-500 mr-3" />;
    }
  };

  // Si aún estamos verificando la autenticación, mostrar pantalla de carga
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
                  sizes="80px"
                  className="object-contain"
                />
              </div>
            </div>
            <h1 className="text-3xl font-bold">Carga tu archivo</h1>
            <p className="text-gray-400 mt-2">
              Arrastra y suelta tu archivo Excel, OpenDocument, CSV o TSV, o
              selecciónalo desde tu dispositivo
            </p>
          </motion.div>

          {/* Error Message */}
          {errorMsg && (
            <motion.div
              className="mb-4 bg-red-600/80 text-white p-3 rounded"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {errorMsg}
            </motion.div>
          )}

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
                  <h3 className="text-xl font-medium mb-2">
                    Arrastra tu archivo aquí
                  </h3>
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
                    accept=".csv,.xls,.xlsx,.ods,.tsv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,application/vnd.oasis.opendocument.spreadsheet,text/csv"
                    className="hidden"
                  />
                </>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="flex items-center mb-4">
                    {getFileIcon()}
                    <div className="text-left">
                      <p className="font-medium">{file.name}</p>
                      <p className="text-sm text-gray-400">
                        {(file.size / 1024).toFixed(2)} KB
                      </p>
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
                  <p className="text-green-500 mb-2">
                    Archivo listo para procesar
                  </p>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gray-700 rounded-lg p-4">
                <h4 className="font-medium mb-2">Excel (.xlsx)</h4>
                <p className="text-sm text-gray-400">Formato Excel moderno</p>
              </div>
              <div className="bg-gray-700 rounded-lg p-4">
                <h4 className="font-medium mb-2">Excel (.xls)</h4>
                <p className="text-sm text-gray-400">
                  Formato Excel tradicional
                </p>
              </div>
              <div className="bg-gray-700 rounded-lg p-4">
                <h4 className="font-medium mb-2">OpenDocument (.ods)</h4>
                <p className="text-sm text-gray-400">Formato OpenDocument</p>
              </div>
              <div className="bg-gray-700 rounded-lg p-4">
                <h4 className="font-medium mb-2">CSV/TSV (.csv/.tsv)</h4>
                <p className="text-sm text-gray-400">Valores separados</p>
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-400">
              <p>
                Asegúrate de que tu archivo tenga encabezados en la primera fila
                para un mejor análisis.
              </p>
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
            <Button
              type="button"
              disabled={!file || isLoading}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleSubmit}
            >
              {isLoading ? (
                <>
                  <FaSpinner className="animate-spin" />
                  <span>Procesando...</span>
                </>
              ) : (
                <>
                  <span>Procesar</span>
                  <FaArrowRight />
                </>
              )}
            </Button>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
