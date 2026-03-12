'use client';
import { useState } from 'react';

export default function ContactForm({ userEmail = '', userName = '' }) {
  const [formData, setFormData] = useState({ 
    nombre: userName || '', 
    email: userEmail || '', 
    mensaje: '' 
  });
  const [status, setStatus] = useState(''); // '' | 'loading' | 'success' | 'error'

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');

    try {
      const resp = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (resp.ok) {
        setStatus('success');
        setFormData({ 
          nombre: userName || '', 
          email: userEmail || '', 
          mensaje: '' 
        }); 
      } else {
        setStatus('error');
      }
    } catch (error) {
      setStatus('error');
    }
  };

  return (
    <div className="max-w-2xl mx-auto w-full mt-8">
      {/* Contenedor estilo Google Classroom (Material Design) */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-300 overflow-hidden">
        
        {/* Cabecera (simulando cabecera de tarea de Classroom) */}
        <div className="border-b border-gray-200 px-6 py-4 flex items-center gap-4 bg-[#f8f9fa]">
          <div className="bg-[#0f4c81] p-2 rounded-full text-white">
            <svg focusable="false" width="24" height="24" viewBox="0 0 24 24" className="fill-current">
              <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"></path>
            </svg>
          </div>
          <div>
            <h2 className="text-[#3c4043] text-xl font-medium tracking-wide">Mensaje a la administración</h2>
            <p className="text-[#5f6368] text-sm mt-0.5">Entrenarte - Consultas generales</p>
          </div>
        </div>

        {/* Cuerpo del formulario */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            
            {/* Campo Nombre (Estilo Material) */}
            <div className="relative">
              <input
                type="text"
                id="nombre"
                required
                readOnly={!!userName}
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                className={`block px-4 pb-3 pt-5 w-full text-sm text-gray-900 bg-gray-50 rounded-md border border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-[#0f4c81] peer ${userName ? 'text-gray-500 bg-gray-100' : ''}`}
                placeholder=" "
              />
              <label htmlFor="nombre" className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-4 z-10 origin-[0] left-4 peer-focus:text-[#0f4c81] peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-4">
                Nombre completo
              </label>
            </div>

            {/* Campo Email */}
            <div className="relative">
              <input
                type="email"
                id="email"
                required
                readOnly={!!userEmail}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={`block px-4 pb-3 pt-5 w-full text-sm text-gray-900 bg-gray-50 rounded-md border border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-[#0f4c81] peer ${userEmail ? 'text-gray-500 bg-gray-100' : ''}`}
                placeholder=" "
              />
              <label htmlFor="email" className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-4 z-10 origin-[0] left-4 peer-focus:text-[#0f4c81] peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-4">
                Correo electrónico
              </label>
            </div>

            {/* Campo Mensaje */}
            <div className="relative">
              <textarea
                id="mensaje"
                required
                rows={5}
                value={formData.mensaje}
                onChange={(e) => setFormData({ ...formData, mensaje: e.target.value })}
                className="block px-4 pb-3 pt-5 w-full text-sm text-gray-900 bg-gray-50 rounded-md border border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-[#0f4c81] peer resize-none"
                placeholder=" "
              />
              <label htmlFor="mensaje" className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-4 z-10 origin-[0] left-4 peer-focus:text-[#0f4c81] peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-4">
                Escribe tu mensaje...
              </label>
            </div>
            
            {/* Botonera inferior (estilo Classroom) */}
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
              
              <div className="text-sm">
                {status === 'success' && <span className="text-green-600 font-medium flex items-center gap-1"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg> Entregado</span>}
                {status === 'error' && <span className="text-red-500 font-medium text-sm">Error al enviar. Intenta nuevamente.</span>}
              </div>

              <button 
                type="submit" 
                disabled={status === 'loading'}
                className="bg-[#0f4c81] hover:bg-[#0a355c] text-white px-6 py-2 rounded-md font-medium text-sm tracking-wide transition-colors disabled:opacity-60 disabled:cursor-not-allowed shadow-sm flex items-center gap-2"
              >
                {status === 'loading' ? 'Enviando...' : 'Enviar mensaje'}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
