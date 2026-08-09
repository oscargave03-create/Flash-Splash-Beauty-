import React from 'react';
import { ShoppingBag, Search, Sparkles, ShieldCheck, Lock, Heart, Menu, X, CheckCircle2 } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { ProductCategory } from '../types';

interface NavbarProps {
  onOpenCart: () => void;
  onOpenAdmin: () => void;
  onSelectCategory: (cat: ProductCategory | 'Todos') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenCart, onOpenAdmin, onSelectCategory }) => {
  const { 
    settings, 
    cartCount, 
    cartTotal, 
    isAdminLoggedIn, 
    activeCategory, 
    setActiveCategory,
    searchQuery,
    setSearchQuery,
    supabaseConfig
  } = useStore();

  const categoriesList: (ProductCategory | 'Todos')[] = ['Todos', ...(settings.categories || [])];

  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const handleCategoryClick = (category: ProductCategory | 'Todos') => {
    setActiveCategory(category);
    onSelectCategory(category);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-rose-100 shadow-xs">
      {/* Announcement Bar */}
      {settings.announcementText && (
        <div className="bg-gradient-to-r from-pink-500 via-rose-400 to-pink-500 text-white text-xs py-2 px-4 text-center font-medium tracking-wide flex items-center justify-center gap-2">
          <Sparkles className="w-3.5 h-3.5 animate-pulse" />
          <span>{settings.announcementText}</span>
          {supabaseConfig.isConnected && (
            <span id="supabase-connected-badge" className="hidden md:inline-flex items-center gap-1 bg-white/20 text-white text-[10px] px-2 py-0.5 rounded-full ml-2">
              <CheckCircle2 className="w-3 h-3 text-emerald-200" /> DB Conectada
            </span>
          )}
        </div>
      )}

      {/* Main Navbar Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => handleCategoryClick('Todos')} 
              className="flex items-center gap-2 text-left group focus:outline-none"
              id="brand-logo-btn"
            >
              {settings.storeLogoUrl ? (
                <img
                  src={settings.storeLogoUrl}
                  alt={settings.storeName}
                  className="w-11 h-11 rounded-2xl object-cover shadow-md shadow-pink-200 border border-pink-200 group-hover:scale-105 transition-transform"
                />
              ) : (
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-300 p-0.5 shadow-md shadow-pink-200 group-hover:scale-105 transition-transform">
                  <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-pink-500" />
                  </div>
                </div>
              )}
              <div>
                <span className="text-xl sm:text-2xl font-serif font-bold tracking-tight bg-gradient-to-r from-rose-900 via-pink-700 to-rose-900 bg-clip-text text-transparent">
                  {settings.storeName}
                </span>
                <p className="text-[10px] text-pink-600 tracking-widest uppercase font-medium -mt-1 hidden sm:block">
                  {settings.storeTagline}
                </p>
              </div>
            </button>
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar perfume, splash, crema..."
                id="search-input-desktop"
                className="w-full pl-10 pr-4 py-2.5 rounded-full bg-rose-50/60 border border-rose-200/80 text-sm text-slate-800 placeholder-rose-400 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:bg-white transition-all"
              />
              <Search className="w-4 h-4 text-pink-400 absolute left-3.5 top-3.5 pointer-events-none" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  id="clear-search-btn"
                  className="absolute right-3 top-3 text-xs text-rose-400 hover:text-rose-600 bg-rose-100 rounded-full w-5 h-5 flex items-center justify-center"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Admin Toggle Button */}
            <button
              onClick={onOpenAdmin}
              id="admin-portal-btn"
              className={`p-2.5 rounded-full text-xs font-semibold transition-all ${
                isAdminLoggedIn
                  ? 'bg-rose-900 text-rose-100 border border-rose-800 shadow-sm'
                  : 'bg-rose-50 text-rose-800 hover:bg-pink-100 border border-pink-200'
              }`}
              title={isAdminLoggedIn ? 'Panel de Administración Activo' : 'Acceso Administrador'}
            >
              {isAdminLoggedIn ? (
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              ) : (
                <Lock className="w-4 h-4 text-pink-600" />
              )}
            </button>

            {/* Shopping Cart Button */}
            <button
              onClick={onOpenCart}
              id="open-cart-btn"
              className="relative flex items-center gap-2 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white px-4 py-2.5 rounded-full shadow-md shadow-pink-200 hover:shadow-lg transition-all font-medium text-xs sm:text-sm active:scale-95"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">Carrito</span>
              <span className="bg-white text-pink-600 text-xs font-bold px-2 py-0.5 rounded-full shadow-xs">
                ${cartTotal.toFixed(2)}
              </span>
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-rose-900 text-white text-[10px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center ring-2 ring-white">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              id="mobile-menu-toggle-btn"
              className="md:hidden p-2 rounded-xl text-slate-700 hover:bg-rose-50 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6 text-pink-600" /> : <Menu className="w-6 h-6 text-pink-600" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Input */}
        <div className="md:hidden pb-3">
          <div className="relative w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar perfume, splash, crema..."
              id="search-input-mobile"
              className="w-full pl-9 pr-4 py-2 rounded-full bg-rose-50/80 border border-rose-200 text-xs text-slate-800 placeholder-rose-400 focus:outline-none focus:ring-2 focus:ring-pink-400"
            />
            <Search className="w-3.5 h-3.5 text-pink-400 absolute left-3 top-2.5 pointer-events-none" />
          </div>
        </div>

        {/* Category Filter Pills Bar */}
        <div className="hidden md:flex items-center gap-2 pb-3 overflow-x-auto scrollbar-none">
          <span className="text-xs font-semibold text-rose-800 uppercase tracking-wider mr-2 flex items-center gap-1">
            Categorías:
          </span>
          {categoriesList.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                id={`category-tab-${cat}`}
                onClick={() => handleCategoryClick(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-rose-900 text-white shadow-sm ring-2 ring-pink-300'
                    : 'bg-rose-50/80 text-rose-800 hover:bg-pink-100 hover:text-rose-900 border border-rose-100'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Mobile Dropdown Category Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-3 border-t border-rose-100 space-y-2">
            <p className="text-xs font-semibold text-rose-800 uppercase tracking-wider px-2">Categorías</p>
            <div className="grid grid-cols-2 gap-2">
              {categoriesList.map((cat) => {
                const isActive = activeCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => handleCategoryClick(cat)}
                    className={`px-3 py-2 rounded-xl text-xs font-medium text-left transition-all ${
                      isActive
                        ? 'bg-rose-900 text-white font-bold'
                        : 'bg-rose-50 text-rose-800 hover:bg-pink-100'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
