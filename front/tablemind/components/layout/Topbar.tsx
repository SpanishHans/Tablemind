"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { FaBars, FaTimes, FaSignOutAlt } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function Topbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Verificar si el usuario está logueado al montar el componente
    const token = localStorage.getItem("access_token");
    setIsLoggedIn(!!token);
  }, []);

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("access_token");
      
      if (!token) {
        return;
      }
      
      // Llamar al endpoint de logout en el backend
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      
      // Independientemente de la respuesta, limpiamos el localStorage
      localStorage.removeItem("access_token");
      localStorage.removeItem("currentPromptId");
      localStorage.removeItem("currentMediaId");
      
      // Redirigir al usuario a la página de inicio de sesión
      router.push("/login");
      
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      // Incluso si hay un error, intentamos cerrar la sesión localmente
      localStorage.removeItem("access_token");
      router.push("/login");
    }
  };

  return (
    <motion.header
      className="fixed top-0 left-0 w-full bg-gray-900 text-white shadow-md z-50"
    >
      <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <div className="w-9 h-9 mr-2 relative">
            <Image src="/images/logo.jpeg" alt="TableMind Logo" fill sizes="36px" className="object-contain" />
          </div>
          <span className="text-2xl font-bold">TableMind</span>
        </Link>
        
        <nav className="hidden md:flex space-x-6 items-center ">
          <Link href="/features" className="hover:text-gray-300 transition">
            Características
          </Link>
          <Link href="/pricing" className="hover:text-gray-300 transition">
            Precios
          </Link>
          <Link href="/faq" className="hover:text-gray-300 transition">
            FAQ
          </Link>
          <Link href="/contact" className="hover:text-gray-300 transition">
            Contacto
          </Link>

          {isLoggedIn ? (
            <>
              <Link href="/prompt">
                <Button
                  variant="secondary"
                  className="cursor-pointer bg-gray-800 hover:bg-gray-700 text-white"
                >
                  Dashboard
                </Button>
              </Link>
              <Button
                variant="outline"
                className="cursor-pointer bg-red-600 hover:bg-red-700 text-white border-none"
                onClick={handleLogout}
              >
                <FaSignOutAlt className="mr-2" />
                Cerrar Sesión
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button
                  variant="secondary"
                  className="cursor-pointer bg-gray-800 hover:bg-gray-700 text-white"
                >
                  Iniciar Sesión
                </Button>
              </Link>
              
              <Link href="/register">
                <Button
                  variant="default"
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 border-none text-white hover:text-white font-semibold cursor-pointer"
                >
                  Comenzar
                </Button>
              </Link>
            </>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-2xl"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <motion.div
          className="md:hidden bg-gray-800 p-6 absolute top-full left-0 w-full flex flex-col space-y-4 text-center"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Link
            href="/features"
            className="hover:text-gray-300 transition"
            onClick={() => setMenuOpen(false)}
          >
            Características
          </Link>
          
          <Link
            href="/pricing"
            className="hover:text-gray-300 transition"
            onClick={() => setMenuOpen(false)}
          >
            Precios
          </Link>
          
          <Link
            href="/faq"
            className="hover:text-gray-300 transition"
            onClick={() => setMenuOpen(false)}
          >
            FAQ
          </Link>
          
          <Link
            href="/contact"
            className="hover:text-gray-300 transition"
            onClick={() => setMenuOpen(false)}
          >
            Contacto
          </Link>
          
          {isLoggedIn ? (
            <>
              <Link href="/prompt" onClick={() => setMenuOpen(false)}>
                <Button
                  variant="outline"
                  className="w-full text-white bg-gray-700 hover:bg-gray-600 cursor-pointer"
                >
                  Dashboard
                </Button>
              </Link>
              <Button
                variant="outline"
                className="w-full bg-red-600 hover:bg-red-700 text-white border-none"
                onClick={() => {
                  setMenuOpen(false);
                  handleLogout();
                }}
              >
                <FaSignOutAlt className="mr-2" />
                Cerrar Sesión
              </Button>
            </>
          ) : (
            <>
              <Link href="/login" onClick={() => setMenuOpen(false)}>
                <Button
                  variant="outline"
                  className="w-full text-white bg-gray-700 hover:bg-gray-600 cursor-pointer"
                >
                  Iniciar Sesión
                </Button>
              </Link>
              
              <Link href="/register" onClick={() => setMenuOpen(false)}>
                <Button
                  variant="outline"
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 border-none text-white hover:text-white font-semibold cursor-pointer"
                >
                  Comenzar
                </Button>
              </Link>
            </>
          )}
        </motion.div>
      )}
    </motion.header>
  );
}