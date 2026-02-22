import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';

export default function InstructionsScreen() {
  return (
    <div className="w-full max-w-md relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "circOut" }}
        className="bg-white/70 backdrop-blur-xl border border-white/50 rounded-3xl shadow-2xl shadow-slate-200/50 overflow-hidden p-8 text-center"
      >
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <ArrowRight size={40} />
        </div>

        <h2 className="text-2xl font-bold text-slate-900 mb-4">
          Aplicativo Instalado!
        </h2>
        
        <p className="text-slate-600 mb-8 leading-relaxed">
          Para acessar o sistema use o atalho do aplicativo criado em seu dispositivo.
        </p>

        <button
          onClick={() => window.location.reload()}
          className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-4 px-4 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2"
        >
          Tentar Acessar Agora
        </button>
      </motion.div>
    </div>
  );
}
