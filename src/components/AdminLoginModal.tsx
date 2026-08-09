import React, { useState } from 'react';
import { X, Lock, ShieldCheck, Key, Eye, EyeOff, User } from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({ isOpen, onClose, onSuccess }) => {
  if (!isOpen) return null;

  const { loginAdmin } = useStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = loginAdmin(username, password);
    if (success) {
      setErrorMsg('');
      onSuccess();
    } else {
      setErrorMsg('Usuario o contraseña incorrectos. Verifica tus credenciales.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="relative bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-rose-100 animate-in fade-in zoom-in-95 duration-200"
        id="admin-login-modal"
      >
        {/* Header */}
        <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-pink-500/20 text-pink-400 border border-pink-500/30">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-serif font-bold">Acceso de Administrador</h3>
              <p className="text-xs text-slate-400">Panel de control de Aura Luxe</p>
            </div>
          </div>
          <button
            onClick={onClose}
            id="close-admin-login-btn"
            className="p-1.5 rounded-full text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Username Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Usuario Administrador
            </label>
            <div className="relative">
              <input
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setErrorMsg('');
                }}
                required
                placeholder="Nombre de usuario..."
                id="admin-username-input"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-rose-200 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 font-medium text-slate-800"
              />
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Contraseña de Administración
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrorMsg('');
                }}
                required
                placeholder="Ingresa la contraseña..."
                id="admin-password-input"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-rose-200 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 font-medium text-slate-800"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errorMsg && (
              <p className="text-xs text-rose-600 font-semibold mt-1.5">{errorMsg}</p>
            )}
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              id="submit-admin-login-btn"
              className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-pink-600 text-white text-xs font-bold shadow-md transition-all"
            >
              Ingresar al Panel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

