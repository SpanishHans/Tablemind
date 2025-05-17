"use client";
import Topbar from "@/components/layout/Topbar";
import Footer from "@/components/layout/Footer";
import { motion } from "framer-motion";

export default function Privacy() {
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
            <h1 className="text-4xl font-bold mb-4">Política de Privacidad</h1>
            <p className="text-gray-400">
              Última actualización: {new Date().toLocaleDateString()}
            </p>
          </motion.div>
          
          <div className="bg-gray-800 rounded-xl p-8 shadow-lg prose prose-invert max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">1. Introducción</h2>
              <p>
                En TableMind, respetamos su privacidad y nos comprometemos a proteger sus datos personales. 
                Esta política de privacidad le informará sobre cómo cuidamos sus datos personales cuando 
                visita nuestro sitio web o utiliza nuestros servicios, y le informará sobre sus derechos 
                de privacidad y cómo la ley le protege.
              </p>
              <p>
                Por favor, lea detenidamente esta política de privacidad para entender nuestras políticas 
                y prácticas relacionadas con sus datos personales y cómo los trataremos.
              </p>
            </section>
            
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">2. Información que recopilamos</h2>
              <p>
                Podemos recopilar, utilizar, almacenar y transferir diferentes tipos de datos personales sobre usted, 
                que hemos agrupado de la siguiente manera:
              </p>
              <ul className="list-disc pl-5 space-y-2 mt-4">
                <li><strong>Datos de identidad:</strong> incluye nombre, apellido, nombre de usuario o identificador similar.</li>
                <li><strong>Datos de contacto:</strong> incluye dirección de correo electrónico y números de teléfono.</li>
                <li><strong>Datos técnicos:</strong> incluye dirección IP, datos de inicio de sesión, tipo y versión del navegador, 
                  configuración de zona horaria y ubicación, tipos y versiones de complementos del navegador, sistema operativo y plataforma.</li>
                <li><strong>Datos de uso:</strong> incluye información sobre cómo utiliza nuestro sitio web, productos y servicios.</li>
                <li><strong>Datos de contenido:</strong> incluye información y contenido que usted nos proporciona, como archivos Excel subidos para análisis.</li>
              </ul>
            </section>
            
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">3. Cómo utilizamos su información</h2>
              <p>
                Utilizamos su información personal para los siguientes propósitos:
              </p>
              <ul className="list-disc pl-5 space-y-2 mt-4">
                <li>Proporcionar y gestionar su cuenta.</li>
                <li>Proporcionar y mejorar nuestros servicios de análisis de datos.</li>
                <li>Comunicarnos con usted, incluyendo notificaciones sobre cambios en nuestros servicios.</li>
                <li>Administrar y proteger nuestro negocio y sitio web.</li>
                <li>Entender cómo los usuarios interactúan con nuestro sitio web para mejorarlo.</li>
                <li>Ofrecer contenido y anuncios relevantes.</li>
                <li>Medir la efectividad de la publicidad que servimos.</li>
              </ul>
            </section>
            
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">4. Seguridad de datos</h2>
              <p>
                Hemos implementado medidas de seguridad apropiadas para prevenir que sus datos personales 
                se pierdan, se utilicen o accedan de forma no autorizada. Además, limitamos el acceso a sus 
                datos personales a aquellos empleados, agentes, contratistas y otros terceros que tienen una 
                necesidad comercial de conocerlos.
              </p>
              <p className="mt-2">
                Hemos implementado procedimientos para manejar cualquier sospecha de violación de datos personales 
                y notificaremos a usted y a cualquier regulador aplicable de una violación donde estamos legalmente 
                obligados a hacerlo.
              </p>
            </section>
            
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">5. Retención de datos</h2>
              <p>
                Solo retendremos sus datos personales durante el tiempo que sea necesario para cumplir con 
                los propósitos para los que los recopilamos, incluyendo para satisfacer cualquier requisito 
                legal, contable o de informes.
              </p>
              <p className="mt-2">
                Para determinar el período de retención apropiado para los datos personales, consideramos la 
                cantidad, naturaleza y sensibilidad de los datos personales, el riesgo potencial de daño por 
                uso o divulgación no autorizada de sus datos personales, los propósitos para los cuales procesamos 
                sus datos personales y si podemos lograr esos propósitos a través de otros medios.
              </p>
            </section>
            
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">6. Sus derechos legales</h2>
              <p>
                Bajo ciertas circunstancias, usted tiene derechos bajo las leyes de protección de datos en relación con sus datos personales:
              </p>
              <ul className="list-disc pl-5 space-y-2 mt-4">
                <li><strong>Solicitar acceso</strong> a sus datos personales.</li>
                <li><strong>Solicitar corrección</strong> de sus datos personales.</li>
                <li><strong>Solicitar eliminación</strong> de sus datos personales.</li>
                <li><strong>Oponerse al procesamiento</strong> de sus datos personales.</li>
                <li><strong>Solicitar restricción</strong> del procesamiento de sus datos personales.</li>
                <li><strong>Solicitar la transferencia</strong> de sus datos personales.</li>
                <li><strong>Derecho a retirar el consentimiento</strong> en cualquier momento.</li>
              </ul>
            </section>
            
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">7. Cookies</h2>
              <p>
                Utilizamos cookies y tecnologías de seguimiento similares para rastrear la actividad en nuestro servicio 
                y almacenar cierta información. Las cookies son archivos con una pequeña cantidad de datos que pueden 
                incluir un identificador único anónimo.
              </p>
              <p className="mt-2">
                Puede instruir a su navegador para que rechace todas las cookies o para que le indique cuándo se envía una cookie. 
                Sin embargo, si no acepta cookies, es posible que no pueda utilizar algunas partes de nuestro servicio.
              </p>
            </section>
            
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">8. Cambios a esta política de privacidad</h2>
              <p>
                Podemos actualizar nuestra política de privacidad de vez en cuando. Le notificaremos sobre cualquier 
                cambio publicando la nueva política de privacidad en esta página y, si los cambios son significativos, 
                le proporcionaremos un aviso más prominente.
              </p>
              <p className="mt-2">
                Se le aconseja revisar esta política de privacidad periódicamente para cualquier cambio. 
                Los cambios a esta política de privacidad son efectivos cuando se publican en esta página.
              </p>
            </section>
            
            <section>
              <h2 className="text-2xl font-bold mb-4">9. Contacto</h2>
              <p>
                Si tiene alguna pregunta sobre esta política de privacidad, puede contactarnos:
              </p>
              <p className="mt-2">
                <strong>Por correo electrónico:</strong> privacidad@tablemind.com<br />
                <strong>Por correo postal:</strong> TableMind, Plaza del Innovador 123, 28004 Madrid, España
              </p>
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}