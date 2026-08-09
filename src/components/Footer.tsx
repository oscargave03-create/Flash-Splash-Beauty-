import React from 'react';
import { Sparkles, Phone, MapPin, Heart, ShieldCheck, Instagram, Facebook, Lock } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { ProductCategory } from '../types';

interface FooterProps {
  onSelectCategory: (cat: ProductCategory | 'Todos') => void;
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectCategory, onOpenAdmin }) => {
  const { settings } = useStore();

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-rose-900/40 mt-16">
      <div className="max-w-7xl mx-auto px-6 py-12 lg:px-8 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2">
              {settings.storeLogoUrl ? (
                <img
                  src={settings.storeLogoUrl}
                  alt={settings.storeName}
                  className="w-8 h-8 rounded-xl object-cover border border-pink-500/50"
                />
              ) : (
                <div className="w-8 h-8 rounded-xl bg-pink-500 flex items-center justify-center text-white">
                  <Sparkles className="w-5 h-5" />
                </div>
              )}
              <span className="text-xl font-serif font-bold text-white tracking-tight">
                {settings.storeName}
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              {settings.storeTagline}. Fragancias finas, cuidado de la piel y bienestar personal para resaltar tu estilo único.
            </p>
            <div className="pt-1 flex items-center gap-2 text-xs text-pink-400 font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Pagos Seguros por Yappy Panamá</span>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">
              Categorías de Catálogo
            </h4>
            <ul className="space-y-2 text-xs">
              {(settings.categories || []).map((cat) => (
                <li key={cat}>
                  <button
                    onClick={() => onSelectCategory(cat)}
                    className="hover:text-pink-300 transition-colors"
                  >
                    {cat}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service & Payment */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">
              Atención & Envíos
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-pink-400 shrink-0" />
                <span>Panamá • Envíos a todo el país</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-pink-400 shrink-0" />
                <span>WhatsApp: {settings.whatsappPhone}</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-sky-500 text-white font-extrabold flex items-center justify-center text-[9px]">
                  Y
                </span>
                <span>Yappy: {settings.yappyPhone}</span>
              </li>
            </ul>
          </div>

          {/* Admin shortcut & Location */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">
              Administración
            </h4>
            <p className="text-xs text-slate-400">
              Panel privado para administradores de {settings.storeName}.
            </p>
            <button
              onClick={onOpenAdmin}
              id="admin-footer-btn"
              className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-pink-600 text-white text-xs font-bold transition-all border border-slate-700 flex items-center gap-2 shadow-sm"
            >
              <Lock className="w-3.5 h-3.5 text-pink-400" />
              <span>Acceso a Administración</span>
            </button>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} {settings.storeName}. Todos los derechos reservados.</p>
          <div className="flex items-center gap-1 text-[11px]">
            <span>Diseñado con</span>
            <Heart className="w-3.5 h-3.5 text-pink-500 fill-pink-500" />
            <span>para Panamá</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
