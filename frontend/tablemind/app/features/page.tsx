"use client";
import Topbar from "@/components/layout/Topbar";
import Footer from "@/components/layout/Footer";
import { motion } from "framer-motion";

export default function Features() {
  const features = [
    {
      title: "Análisis Inteligente de Excel",
      description: "Sube tus archivos Excel y obtén análisis detallados impulsados por IA en segundos.",
      icon: "🧮"
    },
    {
      title: "Visualización de Datos",
      description: "Transforma tus datos en gráficos y visualizaciones de fácil comprensión.",
      icon: "📊"
    },
    {
      title: "Detección de Patrones",
      description: "Detecta automáticamente tendencias, anomalías y patrones en tus datos.",
      icon: "🔍"
    },
    {
      title: "Preguntas en Lenguaje Natural",
      description: "Pregunta sobre tus datos usando lenguaje natural y obtén respuestas precisas.",
      icon: "💬"
    },
    {
      title: "Integración API",
      description: "Conecta TableMind con tus aplicaciones existentes a través de nuestra API.",
      icon: "🔄"
    },
    {
      title: "Exportación de Reportes",
      description: "Exporta análisis y reportes a múltiples formatos para compartir fácilmente.",
      icon: "📤"
    }
  ];

  return (
    <div className="min-h-screen w-full bg-gray-900 text-white">
      <Topbar />
      <div className="pt-20 pb-20">
        <div className="max-w-6xl mx-auto p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl font-bold mb-6">Características de TableMind</h1>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Descubre las poderosas herramientas y capacidades que hacen de TableMind
              la solución definitiva para el análisis de datos en Excel
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-lg"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="bg-gradient-to-br from-blue-900 to-purple-900 rounded-xl p-8 border border-blue-700 shadow-xl mb-20"
          >
            <div className="grid md:grid-cols-2 gap-10 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-6">Interfaz Intuitiva y Fácil de Usar</h2>
                <p className="text-blue-100 mb-6">
                  Nuestra plataforma está diseñada para que cualquier persona, independientemente de su experiencia técnica, 
                  pueda obtener información valiosa de sus datos de Excel. La interfaz limpia y el flujo de trabajo simplificado 
                  te permiten comenzar en minutos.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <div className="bg-blue-500/20 rounded-full p-1 mr-3 mt-1">
                      <svg className="w-4 h-4 text-blue-300" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-blue-100">Subida de archivos con drag & drop</span>
                  </li>
                  <li className="flex items-start">
                    <div className="bg-blue-500/20 rounded-full p-1 mr-3 mt-1">
                      <svg className="w-4 h-4 text-blue-300" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-blue-100">Panel de control personalizable</span>
                  </li>
                  <li className="flex items-start">
                    <div className="bg-blue-500/20 rounded-full p-1 mr-3 mt-1">
                      <svg className="w-4 h-4 text-blue-300" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-blue-100">Asistente de IA conversacional</span>
                  </li>
                </ul>
              </div>
              <div className="relative h-64 rounded-lg overflow-hidden bg-gray-700">
                <div className="w-full h-full flex items-center justify-center text-gray-500">
                  [Imagen de Interfaz]
                </div>
              </div>
            </div>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-16 mb-20">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-gray-800 rounded-xl p-8 border border-gray-700 shadow-lg"
            >
              <h3 className="text-2xl font-bold mb-4">Para Analistas de Datos</h3>
              <p className="text-gray-400 mb-6">
                Potencia tu trabajo con herramientas avanzadas que te permiten profundizar en tus datos
                y descubrir insights significativos sin necesidad de programación compleja.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center text-gray-300">
                  <svg className="w-5 h-5 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Análisis estadístico avanzado
                </li>
                <li className="flex items-center text-gray-300">
                  <svg className="w-5 h-5 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Modelado predictivo
                </li>
                <li className="flex items-center text-gray-300">
                  <svg className="w-5 h-5 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Visualizaciones personalizables
                </li>
              </ul>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-gray-800 rounded-xl p-8 border border-gray-700 shadow-lg"
            >
              <h3 className="text-2xl font-bold mb-4">Para Empresas</h3>
              <p className="text-gray-400 mb-6">
                Transforma tus datos en decisiones comerciales estratégicas con análisis
                escalables que toda la organización puede utilizar y comprender.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center text-gray-300">
                  <svg className="w-5 h-5 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Colaboración en equipo
                </li>
                <li className="flex items-center text-gray-300">
                  <svg className="w-5 h-5 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Integración con sistemas empresariales
                </li>
                <li className="flex items-center text-gray-300">
                  <svg className="w-5 h-5 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Controles de seguridad avanzados
                </li>
              </ul>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h2 className="text-3xl font-bold mb-6">¿Listo para transformar tus datos?</h2>
            <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
              Comienza hoy mismo a descubrir insights valiosos en tus archivos Excel con TableMind.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-lg font-medium">
                Probar Gratis
              </button>
              <button className="px-8 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium">
                Ver Demo
              </button>
            </div>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
}