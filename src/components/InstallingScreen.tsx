import React from 'react';
import { motion } from 'motion/react';
import { Loader2 } from 'lucide-react';

export default function InstallingScreen() {
  return (
    <div className="w-full max-w-md relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "circOut" }}
        className="bg-white/70 backdrop-blur-xl border border-white/50 rounded-3xl shadow-2xl shadow-slate-200/50 overflow-hidden p-8 text-center"
      >
        <div className="mb-6">
          <img src="https://i.ibb.co/JFKTr9sc/logo.png" alt="Logo" className="w-24 h-24 mx-auto object-contain animate-pulse" />
        </div>

        <h2 className="text-2xl font-bold text-slate-900 mb-4">
          Instalando...
        </h2>
        
        <p className="text-slate-600 mb-8 leading-relaxed">
          Aguarde alguns instantes enquanto o aplicativo é configurado em seu dispositivo.
        </p>

        <div className="flex justify-center">
          <Loader2 className="animate-spin text-indigo-600" size={32} />
        </div>
      </motion.div>
    </div>
  );
}
