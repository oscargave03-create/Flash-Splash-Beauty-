import React from 'react';
import { Sparkles, HeartHandshake, ShieldCheck, Truck, ArrowRight, Zap } from 'lucide-react';
import { ProductCategory } from '../types';
import { useStore } from '../context/StoreContext';

interface HeroBannerProps {
  onSelectCategory: (category: ProductCategory) => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ onSelectCategory }) => {
  const { settings } = useStore();
  const categoriesList = (settings.categories || []).slice(0, 4);

  const badgeText = settings.heroBadgeText || 'Colección Exclusiva de Belleza & Fragancias';
  const heroTitle = settings.heroTitle || 'Descubre la fragancia que enamora tu estilo';
  const heroSubtitle = settings.heroSubtitle || 'Perfumes finos, mists ligeros, cremas hidratantes, lociones de sedas y jabones artesanales. Paga directo y seguro mediante Yappy con envíos directos en todo Panamá.';
  const heroImageUrl = settings.heroImageUrl || 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=600';

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-pink-100 via-rose-50 to-white rounded-3xl border border-pink-200/80 my-4 shadow-sm">
      {/* Decorative background glow circles */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-pink-300/20 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-80 h-80 rounded-full bg-rose-200/30 blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6 py-10 sm:py-14 md:py-16 lg:px-12 flex flex-col md:flex-row items-center justify-between gap-8">
        
        {/* Left Column: Text & CTA */}
        <div className="flex-1 text-center md:text-left space-y-5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 border border-pink-200 text-rose-800 text-xs font-semibold shadow-xs backdrop-blur-xs">
            <Sparkles className="w-4 h-4 text-pink-500 animate-spin-slow" />
            <span>{badgeText}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-slate-900 leading-tight tracking-tight">
            {heroTitle}
          </h1>

          <p className="text-sm sm:text-base text-slate-600 max-w-xl leading-relaxed">
            {heroSubtitle}
          </p>

          {/* Value props badges */}
          <div className="pt-1 flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs font-medium text-rose-900">
            <div className="flex items-center gap-1.5 bg-white/70 px-3 py-1.5 rounded-full border border-pink-100 shadow-2xs">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>Pago Rápido Yappy</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/70 px-3 py-1.5 rounded-full border border-pink-100 shadow-2xs">
              <Truck className="w-3.5 h-3.5 text-pink-500" />
              <span>Envíos a todo Panamá</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/70 px-3 py-1.5 rounded-full border border-pink-100 shadow-2xs">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>100% Garantizados</span>
            </div>
          </div>

          {/* Category Shortcuts */}
          <div className="pt-2">
            <p className="text-xs font-bold text-rose-800 uppercase tracking-wider mb-2">
              Explorar Colecciones:
            </p>
            <div className="flex flex-wrap justify-center md:justify-start gap-2">
              {categoriesList.map((cat) => (
                <button
                  key={cat}
                  onClick={() => onSelectCategory(cat)}
                  id={`hero-shortcut-${cat}`}
                  className="bg-white hover:bg-rose-900 hover:text-white text-rose-900 px-4 py-2 rounded-2xl border border-pink-200 text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 group"
                >
                  <span>✨ {cat}</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Visual Product Showcase Collage */}
        <div className="relative w-full md:w-80 lg:w-96 flex justify-center">
          <div className="relative w-64 h-80 sm:w-72 sm:h-96">
            
            {/* Card 1 - Background stacked */}
            <div className="absolute top-4 right-0 w-48 h-64 rounded-3xl overflow-hidden shadow-lg border-2 border-white rotate-6 bg-rose-200">
              <img
                src="https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&q=80&w=600"
                alt="Splash mist showcase"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Card 2 - Main foreground */}
            <div className="absolute top-0 left-2 w-52 h-72 sm:w-60 sm:h-80 rounded-3xl overflow-hidden shadow-xl border-4 border-white -rotate-3 bg-white">
              <img
                src={heroImageUrl}
                alt={heroTitle}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-3 left-3 right-3 bg-white/90 backdrop-blur-md p-2.5 rounded-2xl border border-rose-100 shadow-sm">
                <p className="text-xs font-bold text-slate-900 truncate">{settings.storeName}</p>
                <div className="flex items-center justify-between text-[11px] text-pink-600 font-semibold mt-0.5">
                  <span>Colección</span>
                  <span className="font-extrabold text-rose-900">Destacados</span>
                </div>
              </div>
            </div>

            {/* Yappy badge floating tag */}
            <div className="absolute -bottom-2 right-2 bg-gradient-to-r from-sky-500 to-blue-600 text-white px-3.5 py-1.5 rounded-full shadow-md text-xs font-bold flex items-center gap-1.5 animate-bounce-slow border-2 border-white">
              <HeartHandshake className="w-3.5 h-3.5 text-sky-200" />
              <span>Aceptamos Yappy</span>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
