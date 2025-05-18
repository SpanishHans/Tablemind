"use client";
import { useState } from "react";
import Topbar from "@/components/layout/Topbar";
import Footer from "@/components/layout/Footer";
import { motion } from "framer-motion";
import { FaEnvelope, FaPhone, FaMapMarkerAlt } from "react-icons/fa";

export default function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Here you would normally send the form data to an API
    console.log({ name, email, subject, message });
    
    // Show success message
    setSubmitted(true);
    
    // Reset form
    setName("");
    setEmail("");
    setSubject("");
    setMessage("");
    
    // Reset success message after 5 seconds
    setTimeout(() => {
      setSubmitted(false);
    }, 5000);
  };

  return (
    <div className="min-h-screen w-full bg-gray-900 text-white">
      <Topbar />
      <div className="pt-20 pb-20">
        <div className="max-w-6xl mx-auto p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl font-bold mb-4">Contacta con Nosotros</h1>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Estamos aquí para ayudarte. Envíanos un mensaje y te responderemos lo antes posible.
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 gap-10">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="bg-gray-800 rounded-xl p-8 shadow-lg h-full">
                <h2 className="text-2xl font-bold mb-6">Envíanos un mensaje</h2>
                
                {submitted && (
                  <div className="bg-green-600 text-white p-4 rounded-lg mb-6">
                    ¡Gracias por tu mensaje! Te responderemos lo antes posible.
                  </div>
                )}
                
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label htmlFor="name" className="block text-gray-400 text-sm mb-2">
                      Nombre completo
                    </label>
                    <input
                      type="text"
                      id="name"
                      className="w-full bg-gray-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Tu nombre"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="email" className="block text-gray-400 text-sm mb-2">
                      Correo electrónico
                    </label>
                    <input
                      type="email"
                      id="email"
                      className="w-full bg-gray-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="tu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="subject" className="block text-gray-400 text-sm mb-2">
                      Asunto
                    </label>
                    <input
                      type="text"
                      id="subject"
                      className="w-full bg-gray-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Asunto de tu mensaje"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="mb-6">
                    <label htmlFor="message" className="block text-gray-400 text-sm mb-2">
                      Mensaje
                    </label>
                    <textarea
                      id="message"
                      rows={5}
                      className="w-full bg-gray-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="¿En qué podemos ayudarte?"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      required
                    ></textarea>
                  </div>
                  
                  <button
                    type="submit"
                    className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-lg font-medium"
                  >
                    Enviar Mensaje
                  </button>
                </form>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <div className="bg-gray-800 rounded-xl p-8 shadow-lg h-full">
                <h2 className="text-2xl font-bold mb-6">Información de Contacto</h2>
                
                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="bg-gradient-to-br from-blue-500 to-purple-500 p-3 rounded-lg mr-4">
                      <FaEnvelope className="text-white text-xl" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-1">Email</h3>
                      <p className="text-gray-400">info@tablemind.com</p>
                      <p className="text-gray-400">soporte@tablemind.com</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="bg-gradient-to-br from-blue-500 to-purple-500 p-3 rounded-lg mr-4">
                      <FaPhone className="text-white text-xl" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-1">Teléfono</h3>
                      <p className="text-gray-400">+34 91 123 45 67</p>
                      <p className="text-gray-400">Lun-Vie: 9:00 - 18:00</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="bg-gradient-to-br from-blue-500 to-purple-500 p-3 rounded-lg mr-4">
                      <FaMapMarkerAlt className="text-white text-xl" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-1">Oficina</h3>
                      <p className="text-gray-400">
                        Plaza del Innovador 123<br />
                        28004 Madrid<br />
                        España
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-10">
                  <h3 className="text-xl font-semibold mb-4">Síguenos</h3>
                  <div className="flex space-x-4">
                    <a href="#" className="bg-gray-700 hover:bg-gray-600 p-3 rounded-full transition-colors">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                      </svg>
                    </a>
                    <a href="#" className="bg-gray-700 hover:bg-gray-600 p-3 rounded-full transition-colors">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z" />
                      </svg>
                    </a>
                    <a href="#" className="bg-gray-700 hover:bg-gray-600 p-3 rounded-full transition-colors">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                      </svg>
                    </a>
                    <a href="#" className="bg-gray-700 hover:bg-gray-600 p-3 rounded-full transition-colors">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19.54 0c1.356 0 2.46 1.104 2.46 2.472v19.056c0 1.368-1.104 2.472-2.46 2.472h-15.080c-1.356 0-2.46-1.104-2.46-2.472v-19.056c0-1.368 1.104-2.472 2.46-2.472h15.080zm-7.54 16.464c2.574 0 4.664-2.097 4.664-4.677 0-2.577-2.090-4.673-4.664-4.673-2.576 0-4.664 2.097-4.664 4.673 0 2.58 2.088 4.677 4.664 4.677zm0-3.081c.873 0 1.581-.708 1.581-1.583 0-.874-.708-1.582-1.581-1.582-.873 0-1.583.708-1.583 1.582 0 .875.71 1.583 1.583 1.583zm-8.066-5.947h6.924l-1.12 1.08h-5.908v13.083h15.942v-13.088h-5.908l1.12-1.080h6.924v15.247h-19.083v-15.247z" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mt-16"
          >
            <div className="bg-gray-800 rounded-xl p-8 shadow-lg">
              <h2 className="text-2xl font-bold mb-6 text-center">Preguntas Frecuentes</h2>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold mb-2">¿Cuánto tiempo tardan en responder?</h3>
                  <p className="text-gray-400">
                    Intentamos responder a todas las consultas en un plazo de 24-48 horas laborables.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-2">¿Ofrecen soporte técnico por teléfono?</h3>
                  <p className="text-gray-400">
                    Sí, los clientes de planes Profesional y Empresarial tienen acceso a soporte telefónico.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-2">¿Puedo solicitar una demostración?</h3>
                  <p className="text-gray-400">
                    Por supuesto, puedes solicitar una demostración personalizada a través de nuestro formulario de contacto.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-2">¿Tienen oficinas fuera de España?</h3>
                  <p className="text-gray-400">
                    Actualmente nuestra sede principal está en Madrid, pero ofrecemos soporte remoto a nivel internacional.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
}