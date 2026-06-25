import React, { ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps { isOpen: boolean; onClose: () => void; title: string; children: ReactNode; size?: 'sm' | 'md' | 'lg'; }

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;
  const sizes: Record<string, string> = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl' };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative rounded-xl shadow-2xl w-full mx-4 ${sizes[size]}`} style={{ background: '#1E293B', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <h2 className="text-base font-bold text-white">{title}</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"><X className="w-4 h-4 text-slate-400" /></button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
