"use client";
import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { FaUser, FaLock, FaEnvelope, FaGoogle, FaMicrosoft } from "react-icons/fa";

import Topbar from "@/components/layout/Topbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    if (!acceptTerms) {
      setErrorMsg("Debes aceptar los términos y condiciones.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg("Las contraseñas no coinciden.");
      return;
    }
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("username", name);
      formData.append("email", email);
      formData.append("password", password);
      
      const apiUrl = "/api/auth/registro";

      const res = await fetch(apiUrl, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        setErrorMsg(data.detail || "Error al registrarse");
      } else {
        setSuccessMsg("Registro exitoso. Redireccionando...");
        setName("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setAcceptTerms(false);
        // Redirect to prompt page after a short delay to show success message
        setTimeout(() => {
          window.location.href = "/prompt";
        }, 1500);
      }
    } catch {
      setErrorMsg("Error de conexión con el servidor.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen w-full bg-gray-900 text-white">
      <Topbar />
      <div className="pt-20 pb-20">
        <div className="max-w-4xl mx-auto p-8">
          <motion.div
            className="bg-gray-800 rounded-lg shadow-xl overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex flex-col md:flex-row">
              <div className="w-full md:w-5/12 bg-gradient-to-br from-blue-500 to-purple-500 p-8 flex flex-col justify-center items-center">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="text-center"
                >
                  <div className="mb-6 flex justify-center">
                    <div className="w-32 h-32 flex items-center justify-center">
                      <img src="/images/logo.jpeg" alt="TableMind Logo" className="w-full h-full" />
                    </div>
                  </div>
                  <h2 className="text-3xl font-bold mb-3">TableMind</h2>
                  <p className="text-blue-100 mb-6">
                    Únete a miles de profesionales que usan TableMind para analizar datos de Excel con IA
                  </p>
                  <div className="space-y-4 text-left">
                    <div className="flex items-start">
                      <div className="bg-white/20 rounded-full p-2 mr-3 mt-1">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <p className="text-sm text-blue-100">Sube archivos Excel para un análisis instantáneo con IA</p>
                    </div>
                    <div className="flex items-start">
                      <div className="bg-white/20 rounded-full p-2 mr-3 mt-1">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <p className="text-sm text-blue-100">Obtén información accionable de tus datos</p>
                    </div>
                    <div className="flex items-start">
                      <div className="bg-white/20 rounded-full p-2 mr-3 mt-1">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <p className="text-sm text-blue-100">Plan gratuito disponible para comenzar</p>
                    </div>
                  </div>
                </motion.div>
              </div>
              <div className="w-full md:w-7/12 p-8">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold mb-1">Crear una cuenta</h2>
                    <p className="text-gray-400">Completa el formulario para comenzar</p>
                  </div>
                  <form onSubmit={handleSubmit}>
                    {errorMsg && (
                      <div className="bg-red-600 text-white p-2 rounded mb-4">{errorMsg}</div>
                    )}
                    {successMsg && (
                      <div className="bg-green-600 text-white p-2 rounded mb-4">{successMsg}</div>
                    )}
                    <div className="mb-4">
                      <label className="block text-gray-400 text-sm mb-2" htmlFor="name">
                        Nombre completo
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FaUser className="text-gray-500" />
                        </div>
                        <input
                          id="name"
                          type="text"
                          className="bg-gray-700 text-white rounded-lg block w-full pl-10 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="Ingresa tu nombre completo"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className="mb-4">
                      <label className="block text-gray-400 text-sm mb-2" htmlFor="email">
                        Correo electrónico
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FaEnvelope className="text-gray-500" />
                        </div>
                        <input
                          id="email"
                          type="email"
                          className="bg-gray-700 text-white rounded-lg block w-full pl-10 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="Ingresa tu correo electrónico"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className="mb-4">
                      <label className="block text-gray-400 text-sm mb-2" htmlFor="password">
                        Contraseña
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FaLock className="text-gray-500" />
                        </div>
                        <input
                          id="password"
                          type="password"
                          className="bg-gray-700 text-white rounded-lg block w-full pl-10 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="Crea una contraseña"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className="mb-6">
                      <label className="block text-gray-400 text-sm mb-2" htmlFor="confirm-password">
                        Confirmar contraseña
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FaLock className="text-gray-500" />
                        </div>
                        <input
                          id="confirm-password"
                          type="password"
                          className="bg-gray-700 text-white rounded-lg block w-full pl-10 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="Confirma tu contraseña"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className="flex items-center mb-6">
                      <input
                        id="accept-terms"
                        type="checkbox"
                        className="h-4 w-4 text-purple-600 rounded"
                        checked={acceptTerms}
                        onChange={(e) => setAcceptTerms(e.target.checked)}
                        required
                      />
                      <label htmlFor="accept-terms" className="ml-2 block text-sm text-gray-400">
                        Acepto los <Link href="/terms" className="text-purple-400 hover:text-purple-300">Términos de Servicio</Link> y <Link href="/privacy" className="text-purple-400 hover:text-purple-300">Política de Privacidad</Link>
                      </label>
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 py-3 rounded-lg font-semibold"
                      disabled={loading}
                    >
                      {loading ? "Registrando..." : "Crear Cuenta"}
                    </Button>
                  </form>
                  <div className="mt-6">
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-600"></div>
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-gray-800 text-gray-400">O regístrate con</span>
                      </div>
                    </div>
                    <div className="mt-6 grid grid-cols-2 gap-3">
                      <button className="bg-gray-700 hover:bg-gray-600 py-2 px-4 rounded-lg flex items-center justify-center">
                        <FaGoogle className="mr-2" />
                        Google
                      </button>
                      <button className="bg-gray-700 hover:bg-gray-600 py-2 px-4 rounded-lg flex items-center justify-center">
                        <FaMicrosoft className="mr-2" />
                        Microsoft
                      </button>
                    </div>
                  </div>
                  <div className="mt-6 text-center">
                    <p className="text-gray-400">
                      ¿Ya tienes una cuenta?{" "}
                      <Link href="/login" className="text-purple-400 hover:text-purple-300 font-medium">
                        Inicia sesión
                      </Link>
                    </p>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
}