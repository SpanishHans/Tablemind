"use client";
import Topbar from "@/components/layout/Topbar";
import { motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import { FaGoogle, FaLock, FaMicrosoft, FaUser } from "react-icons/fa";
import Image from 'next/image';

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("username", username);
      formData.append("password", password);

      // Always use the API proxy configured in next.config.js
      // This ensures the browser never tries to directly access the backend container
      const apiUrl = "/api/auth/login";

      const res = await fetch(apiUrl, {
        method: "POST",
        body: formData,
        credentials: "include"
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.detail || "Error al iniciar sesión");
      } else {
        localStorage.setItem("access_token", data.access_token);
        window.location.href = "/prompt";
      }
    } catch (error) {
      console.error("Login error:", error);
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
                    <div className="w-32 h-32 flex items-center justify-center relative">
                      <Image
                        src="/images/logo.jpeg"
                        alt="TableMind Logo"
                        fill
                        className="object-contain"
                        priority
                      />
                    </div>
                  </div>
                  <h2 className="text-3xl font-bold mb-3">Bienvenido a TableMind</h2>
                  <p className="text-blue-100 mb-6">
                    Ingresa para analizar tus archivos Excel con Inteligencia Artificial.
                  </p>
                </motion.div>
              </div>
              <div className="w-full md:w-7/12 p-8">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold mb-1">Iniciar sesión</h2>
                    <p className="text-gray-400">Accede a tu cuenta para continuar</p>
                  </div>
                  <form onSubmit={handleSubmit}>
                    {errorMsg && (
                      <div className="bg-red-600 text-white p-2 rounded mb-4">{errorMsg}</div>
                    )}
                    <div className="mb-4">
                      <label className="block text-gray-400 text-sm mb-2" htmlFor="username">
                        Usuario o correo
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FaUser className="text-gray-500" />
                        </div>
                        <input
                          id="username"
                          type="text"
                          className="bg-gray-700 text-white rounded-lg block w-full pl-10 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="Usuario o correo"
                          value={username}
                          onChange={e => setUsername(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className="mb-6">
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
                          placeholder="Contraseña"
                          value={password}
                          onChange={e => setPassword(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 py-3 rounded-lg font-semibold"
                      disabled={loading}
                    >
                      {loading ? "Entrando..." : "Entrar"}
                    </button>
                  </form>
                  <div className="mt-6">
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-600"></div>
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-gray-800 text-gray-400">O accede con</span>
                      </div>
                    </div>
                    <div className="mt-6 grid grid-cols-2 gap-3">
                      <button type="button" className="bg-gray-700 hover:bg-gray-600 py-2 px-4 rounded-lg flex items-center justify-center">
                        <FaGoogle className="mr-2" />
                        Google
                      </button>
                      <button type="button" className="bg-gray-700 hover:bg-gray-600 py-2 px-4 rounded-lg flex items-center justify-center">
                        <FaMicrosoft className="mr-2" />
                        Microsoft
                      </button>
                    </div>
                  </div>
                  <div className="mt-6 text-center">
                    <p className="text-gray-400">
                      ¿No tienes una cuenta?{" "}
                      <Link href="/register" className="text-purple-400 hover:text-purple-300 font-medium">
                        Regístrate
                      </Link>
                    </p>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}