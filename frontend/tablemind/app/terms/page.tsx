"use client";
import Topbar from "@/components/layout/Topbar";
import Footer from "@/components/layout/Footer";
import { motion } from "framer-motion";

export default function Terms() {
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
            <h1 className="text-4xl font-bold mb-4">Términos y Condiciones</h1>
            <p className="text-gray-400">
              Última actualización: {new Date().toLocaleDateString()}
            </p>
          </motion.div>
          
          <div className="bg-gray-800 rounded-xl p-8 shadow-lg prose prose-invert max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">1. Introducción</h2>
              <p>
                Bienvenido a TableMind. Estos Términos y Condiciones rigen el uso de nuestros servicios, 
                incluyendo nuestra aplicación web, API y cualquier otro servicio relacionado 
                (colectivamente, los &quot;Servicios&quot;).
              </p>
              <p>
                Al acceder o utilizar nuestros Servicios, usted acepta estar sujeto a estos Términos y Condiciones. 
                Si no está de acuerdo con alguna parte de estos términos, no podrá acceder a los Servicios.
              </p>
            </section>
            
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">2. Definiciones</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>&quot;Nosotros&quot;, &quot;nuestro&quot; y &quot;TableMind&quot;</strong> se refieren a la empresa TableMind, sus subsidiarias, afiliados, directores y empleados.</li>
                <li><strong>&quot;Usted&quot; y &quot;Usuario&quot;</strong> se refieren a cualquier persona que acceda o utilice nuestros Servicios.</li>
                <li><strong>&quot;Contenido&quot;</strong> se refiere a todos los datos, textos, información, imágenes, videos y otros materiales que se cargan, descargan o aparecen en nuestros Servicios.</li>
              </ul>
            </section>
            
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">3. Registro y Cuentas</h2>
              <p>
                Para utilizar ciertas funciones de nuestros Servicios, es posible que deba registrarse y crear una cuenta. 
                Usted acepta proporcionar información precisa, actual y completa durante el proceso de registro y mantener 
                y actualizar dicha información para mantenerla precisa, actual y completa.
              </p>
              <p>
                Usted es responsable de mantener la confidencialidad de su contraseña y de todas las actividades que ocurran bajo su cuenta. 
                Debe notificarnos inmediatamente sobre cualquier uso no autorizado de su cuenta o cualquier otra violación de seguridad.
              </p>
            </section>
            
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">4. Licencia y Restricciones</h2>
              <p>
                Sujeto a estos Términos y Condiciones, le otorgamos una licencia limitada, no exclusiva, no transferible y revocable 
                para utilizar nuestros Servicios para sus fines comerciales o personales.
              </p>
              <p>
                Usted no puede:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Utilizar nuestros Servicios de manera que infrinja cualquier ley o regulación aplicable.</li>
                <li>Intentar interferir con, comprometer la integridad o seguridad del sistema, o descifrar cualquier transmisión hacia o desde los servidores que ejecutan nuestros Servicios.</li>
                <li>Copiar, modificar, distribuir, vender o alquilar cualquier parte de nuestros Servicios.</li>
                <li>Utilizar técnicas de ingeniería inversa o intentar extraer el código fuente de nuestro software.</li>
              </ul>
            </section>
            
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">5. Propiedad Intelectual</h2>
              <p>
                Nuestros Servicios y todo el contenido, características y funcionalidad (incluyendo, pero no limitado a, 
                toda la información, software, texto, imágenes, diseños, gráficos, logotipos) son propiedad de TableMind 
                y están protegidos por leyes de propiedad intelectual.
              </p>
              <p>
                Cualquier comentario, sugerencia, idea u otra información sobre nuestros Servicios que usted proporcione 
                puede ser utilizado por nosotros sin restricciones ni compensación para usted.
              </p>
            </section>
            
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">6. Privacidad</h2>
              <p>
                Su privacidad es importante para nosotros. Nuestra Política de Privacidad explica cómo recopilamos, 
                utilizamos y divulgamos información sobre usted. Al utilizar nuestros Servicios, usted acepta la 
                recopilación, uso y divulgación de información como se describe en nuestra Política de Privacidad.
              </p>
            </section>
            
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">7. Terminación</h2>
              <p>
                Podemos terminar o suspender su acceso a nuestros Servicios inmediatamente, sin previo aviso ni responsabilidad, 
                por cualquier motivo, incluyendo, sin limitación, si usted viola estos Términos y Condiciones.
              </p>
              <p>
                Todas las disposiciones de estos Términos y Condiciones que, por su naturaleza, deberían sobrevivir a la terminación, 
                sobrevivirán a la terminación, incluyendo, sin limitación, disposiciones de propiedad, renuncias de garantía y limitaciones de responsabilidad.
              </p>
            </section>
            
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">8. Cambios a los Términos</h2>
              <p>
                Nos reservamos el derecho, a nuestra sola discreción, de modificar o reemplazar estos Términos y Condiciones en cualquier momento. 
                Si una revisión es material, haremos esfuerzos razonables para proporcionar al menos 30 días de aviso antes de que los nuevos 
                términos entren en vigor.
              </p>
              <p>
                Al continuar accediendo o utilizando nuestros Servicios después de que esas revisiones entren en vigor, 
                usted acepta estar sujeto a los términos revisados.
              </p>
            </section>
            
            <section>
              <h2 className="text-2xl font-bold mb-4">9. Contacto</h2>
              <p>
                Si tiene alguna pregunta sobre estos Términos y Condiciones, póngase en contacto con nosotros en:
              </p>
              <p className="mt-2">
                <strong>Correo electrónico:</strong> legal@tablemind.com<br />
                <strong>Dirección:</strong> TableMind, Plaza del Innovador 123, 28004 Madrid, España
              </p>
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}