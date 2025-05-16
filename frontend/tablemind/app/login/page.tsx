"use client";
import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { FaUser, FaLock, FaGoogle, FaMicrosoft } from "react-icons/fa";

import Topbar from "@/components/layout/Topbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aquí iría la lógica de autenticación
    console.log("Login attempt with:", { email, password, rememberMe });
    
    // Redireccionamos al usuario a la página de prompt
    window.location.href = "/prompt";
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
              {/* Logo Section - Left Side */}
              <div className="w-full md:w-5/12 bg-gradient-to-br from-blue-500 to-purple-500 p-8 flex flex-col justify-center items-center">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="text-center"
                >
                  <div className="mb-6 flex justify-center">
                    {/* Logo de TableMind */}
                    <div className="w-32 h-32 flex items-center justify-center">
                      <img src="/images/logo.jpeg" alt="TableMind Logo" className="w-full h-full" />
                    </div>
                  </div>
                  <h2 className="text-3xl font-bold mb-3">TableMind</h2>
                  <p className="text-blue-100">
                    Analiza tus datos de Excel con el poder de la IA
                  </p>
                  
                  <div className="mt-8">
                    <p className="text-sm text-blue-200 mb-4">De confianza para profesionales de datos en todo el mundo</p>
                    <div className="flex justify-center space-x-4">
                      {/* Here you could add partner logos */}
                      <div className="w-8 h-8 bg-white/20 rounded-full"></div>
                      <div className="w-8 h-8 bg-white/20 rounded-full"></div>
                      <div className="w-8 h-8 bg-white/20 rounded-full"></div>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Login Form - Right Side */}
              <div className="w-full md:w-7/12 p-8">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold mb-1">¡Bienvenido de nuevo!</h2>
                    <p className="text-gray-400">Por favor inicia sesión en tu cuenta</p>
                  </div>

                  <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                      <label className="block text-gray-400 text-sm mb-2" htmlFor="email">
                        Correo o nombre de usuario
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FaUser className="text-gray-500" />
                        </div>
                        <input
                          id="email"
                          type="text"
                          className="bg-gray-700 text-white rounded-lg block w-full pl-10 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="Ingresa tu correo o usuario"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-gray-400 text-sm" htmlFor="password">
                          Contraseña
                        </label>
                        <Link href="/forgot-password" className="text-sm text-purple-400 hover:text-purple-300">
                          ¿Olvidaste tu contraseña?
                        </Link>
                      </div>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FaLock className="text-gray-500" />
                        </div>
                        <input
                          id="password"
                          type="password"
                          className="bg-gray-700 text-white rounded-lg block w-full pl-10 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="Ingresa tu contraseña"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="flex items-center mb-6">
                      <input
                        id="remember-me"
                        type="checkbox"
                        className="h-4 w-4 text-purple-600 rounded"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                      />
                      <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-400">
                        Recordarme
                      </label>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 py-3 rounded-lg font-semibold"
                    >
                      Iniciar Sesión
                    </Button>
                  </form>

                  <div className="mt-6">
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-600"></div>
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-gray-800 text-gray-400">O continuar con</span>
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

      <Footer />
    </div>
  );
}