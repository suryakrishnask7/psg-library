import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ message, type = 'info', onClose }) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [message, onClose]);

  if (!message) return null;

  const isSuccess = type === 'success';
  const isError = type === 'error';

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 bg-gray-900/95 backdrop-blur-md text-white rounded-2xl shadow-xl border border-white/10 animate-in slide-in-from-bottom-5 duration-200 max-w-sm">
      {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />}
      {isError && <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />}
      {!isSuccess && !isError && <Info className="w-5 h-5 text-blue-400 flex-shrink-0" />}

      <span className="text-xs font-medium text-gray-100 flex-1">{message}</span>

      <button
        onClick={onClose}
        className="p-1 text-gray-400 hover:text-white rounded-lg transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
