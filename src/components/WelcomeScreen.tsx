import React from 'react';
import { motion } from 'motion/react';
import { Download, Share } from 'lucide-react';

interface WelcomeScreenProps {
  onInstall: () => void;
  isIOS: boolean;
  canInstall: boolean;
}

export default function WelcomeScreen({ onInstall, isIOS, canInstall }: WelcomeScreenProps) {
  return (
    <div className="w-full max-w-md relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "circOut" }}
        className="bg-white/70 backdrop-blur-xl border border-white/50 rounded-3xl shadow-2xl shadow-slate-200/50 overflow-hidden p-8 text-center"
      >
        <div className="mb-6">
          <img src="/logo.png" alt="Logo" className="w-24 h-24 mx-auto object-contain" />
        </div>
        
        <h1 className="text-2xl font-bold text-slate-900 mb-4">
          Seja bem vindo ao Sistema Integrado de Informações!
        </h1>
        
        <p className="text-slate-600 mb-8 leading-relaxed">
          Para acessar o sistema clique no botão abaixo e instale o aplicativo em seu dispositivo.
        </p>

        {isIOS ? (
          <div className="text-sm text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-100 text-left">
            <p className="flex items-center gap-2 mb-2">
              1. Toque em <Share size={16} className="text-blue-500" /> (Compartilhar)
            </p>
            <p className="flex items-center gap-2">
              2. Selecione <span className="font-medium">"Adicionar à Tela de Início"</span>
            </p>
          </div>
        ) : (
          canInstall ? (
            <button
              onClick={onInstall}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-4 px-4 rounded-2xl transition-all duration-300 shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2"
            >
              <Download size={20} />
              Instalar Aplicativo
            </button>
          ) : (
            <div className="p-4 bg-amber-50 text-amber-800 rounded-xl text-sm">
              Seu navegador não suporta instalação automática ou o app já está instalado. Tente abrir pelo menu do navegador.
            </div>
          )
        )}
      </motion.div>
    </div>
  );
}
