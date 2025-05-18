"use client";
import Topbar from "@/components/layout/Topbar";
import Footer from "@/components/layout/Footer";
import { motion } from "framer-motion";
import { useState } from "react";

export default function FAQ() {
  const faqs = [
    {
      question: "¿Qué es TableMind?",
      answer: "TableMind es una plataforma de análisis de datos impulsada por IA que permite a usuarios y empresas obtener insights valiosos de sus archivos Excel sin necesidad de conocimientos técnicos avanzados."
    },
    {
      question: "¿Qué tipos de archivos puedo analizar con TableMind?",
      answer: "Actualmente, TableMind soporta archivos Excel (.xlsx, .xls), CSV y hojas de cálculo de Google Sheets. Estamos trabajando para ampliar la compatibilidad con más formatos en el futuro."
    },
    {
      question: "¿Mis datos están seguros?",
      answer: "Sí, la seguridad de tus datos es nuestra prioridad. Utilizamos encriptación de extremo a extremo, y tus archivos se procesan en servidores seguros. Además, no almacenamos permanentemente tus datos a menos que elijas guardarlos en tu cuenta."
    },
    {
      question: "¿Necesito conocimientos de análisis de datos para usar TableMind?",
      answer: "No, TableMind está diseñado para ser accesible a usuarios de todos los niveles. Nuestra IA se encarga del análisis complejo, permitiéndote hacer preguntas en lenguaje natural sobre tus datos."
    },
    {
      question: "¿Cuál es el tamaño máximo de archivo que puedo subir?",
      answer: "Los límites de tamaño de archivo dependen de tu plan. Los usuarios del plan gratuito pueden subir archivos de hasta 5MB, los usuarios del plan Profesional hasta 50MB, y los usuarios del plan Empresarial hasta 200MB."
    },
    {
      question: "¿Puedo exportar los resultados de mis análisis?",
      answer: "Sí, puedes exportar tus análisis en varios formatos, incluyendo PDF, Excel, CSV y presentaciones de PowerPoint, dependiendo de tu plan de suscripción."
    },
    {
      question: "¿Cómo funciona el sistema de créditos?",
      answer: "Cada análisis que realizas consume un crédito. El número de créditos disponibles depende de tu plan de suscripción. Los créditos se renuevan mensualmente con tu suscripción."
    },
    {
      question: "¿Puedo cancelar mi suscripción en cualquier momento?",
      answer: "Sí, puedes cancelar tu suscripción en cualquier momento desde la configuración de tu cuenta. No hay contratos a largo plazo ni cargos por cancelación."
    },
    {
      question: "¿Ofrecen soporte técnico?",
      answer: "Sí, todos los usuarios tienen acceso a nuestro centro de ayuda. Los usuarios de planes pagos tienen acceso a soporte técnico por correo electrónico, y los usuarios del plan Empresarial tienen soporte prioritario 24/7."
    },
    {
      question: "¿TableMind funciona con cualquier idioma?",
      answer: "Actualmente, TableMind soporta análisis en español, inglés, francés, alemán y portugués. Estamos trabajando constantemente para añadir soporte para más idiomas."
    }
  ];

  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen w-full bg-gray-900 text-white">
      <Topbar />
      <div className="pt-20 pb-20">
        <div className="max-w-4xl mx-auto p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl font-bold mb-4">Preguntas Frecuentes</h1>
            <p className="text-xl text-gray-400">
              Encuentra respuestas a las preguntas más comunes sobre TableMind
            </p>
          </motion.div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-6 py-4 text-left font-semibold flex justify-between items-center hover:bg-gray-750 transition-colors"
                >
                  {faq.question}
                  <svg
                    className={`w-5 h-5 transform transition-transform ${
                      openIndex === index ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {openIndex === index && (
                  <div className="px-6 py-4 bg-gray-750 border-t border-gray-700">
                    <p className="text-gray-300">{faq.answer}</p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-16 text-center p-8 bg-gradient-to-br from-blue-900 to-purple-900 rounded-xl border border-blue-800"
          >
            <h3 className="text-2xl font-bold mb-4">¿No encuentras la respuesta que buscas?</h3>
            <p className="text-blue-100 mb-6">
              Nuestro equipo de soporte está disponible para ayudarte con cualquier pregunta que tengas.
            </p>
            <button className="px-8 py-3 bg-white text-purple-900 hover:bg-gray-100 rounded-lg font-medium">
              Contactar Soporte
            </button>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
}