import React from 'react';
import { Check, Loader2 } from 'lucide-react';

export default function SuccessModal({ isOpen, onClose, title = "¡Excelente!", message = "Operación realizada con éxito.", isLoading = false }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden border border-zinc-200 dark:border-zinc-800 animate-fade-in-up transform transition-all">

                <div className="p-8 flex flex-col items-center text-center">
                    {isLoading ? (
                        <>
                            <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-6">
                                <Loader2 className="w-10 h-10 text-red-600 animate-spin" strokeWidth={3} />
                            </div>
                            <h3 className="text-2xl font-black text-zinc-900 dark:text-white mb-2 tracking-tight">
                                Enviando...
                            </h3>
                            <p className="text-zinc-600 dark:text-zinc-400 mb-8 leading-relaxed">
                                Estamos procesando tu solicitud.
                            </p>
                        </>
                    ) : (
                        <>
                            {/* Animated Checkmark Circle */}
                            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6 animate-bounce-slow">
                                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/40">
                                    <Check className="w-10 h-10 text-white animate-pulse" strokeWidth={3} />
                                </div>
                            </div>

                            <h3 className="text-2xl font-black text-zinc-900 dark:text-white mb-2 tracking-tight">
                                {title}
                            </h3>

                            <p className="text-zinc-600 dark:text-zinc-400 mb-8 leading-relaxed">
                                {message}
                            </p>

                            <button
                                onClick={onClose}
                                className="w-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-bold py-3.5 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl"
                            >
                                Entendido, Continuar
                            </button>
                        </>
                    )}
                </div>

                {/* Decorative Bottom Line */}
                <div className={`h-2 w-full ${isLoading ? 'bg-zinc-200 dark:bg-zinc-700 animate-pulse' : 'bg-gradient-to-r from-green-400 via-green-500 to-emerald-600'}`} />
            </div>
        </div>
    );
}
