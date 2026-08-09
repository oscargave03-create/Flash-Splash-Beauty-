import React, { useState } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { YappyCheckoutModal } from './components/YappyCheckoutModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { AdminDashboard } from './components/AdminDashboard';
import { Footer } from './components/Footer';
import { Product, ProductCategory } from './types';
import { Sparkles, SlidersHorizontal, SearchX, CheckCircle2 } from 'lucide-react';

function CatalogContent() {
  const {
    products,
    activeCategory,
    setActiveCategory,
    searchQuery,
    setSearchQuery,
    selectedScentFilter,
    setSelectedScentFilter,
    sortBy,
    setSortBy,
    isAdminLoggedIn,
  } = useStore();

  // Modals & Drawers State
  const [selectedProductDetail, setSelectedProductDetail] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isAdminDashboardOpen, setIsAdminDashboardOpen] = useState(false);
  const [editingProductFromCard, setEditingProductFromCard] = useState<Product | null>(null);

  // Collect all unique scent notes for interactive filter pills
  const allScentNotes = Array.from(
    new Set(products.flatMap((p) => p.scentNotes || []))
  ).slice(0, 8);

  // Filter products by category, search query, and scent note
  let filteredProducts = products.filter((product) => {
    // Category filter
    if (activeCategory !== 'Todos' && product.category !== activeCategory) {
      return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = product.name.toLowerCase().includes(q);
      const matchDesc = product.description.toLowerCase().includes(q);
      const matchCategory = product.category.toLowerCase().includes(q);
      const matchNotes = product.scentNotes?.some((n) => n.toLowerCase().includes(q));
      if (!matchName && !matchDesc && !matchCategory && !matchNotes) return false;
    }

    // Scent note filter
    if (selectedScentFilter !== 'Todos') {
      if (!product.scentNotes?.includes(selectedScentFilter)) return false;
    }

    return true;
  });

  // Sort products
  filteredProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    // 'featured'
    if (a.isBestSeller && !b.isBestSeller) return -1;
    if (!a.isBestSeller && b.isBestSeller) return 1;
    return 0;
  });

  const handleOpenAdminPortal = () => {
    if (isAdminLoggedIn) {
      setIsAdminDashboardOpen(true);
    } else {
      setIsAdminLoginOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F9] text-slate-800 flex flex-col font-sans selection:bg-pink-200 selection:text-rose-900">
      {/* Top Navbar */}
      <Navbar
        onOpenCart={() => setIsCartOpen(true)}
        onOpenAdmin={handleOpenAdminPortal}
        onSelectCategory={(cat) => setActiveCategory(cat)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        
        {/* Hero Showcase Banner */}
        <HeroBanner onSelectCategory={(cat) => setActiveCategory(cat)} />

        {/* Catalog Control Section */}
        <section className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-rose-100/80 shadow-2xs">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-serif font-bold text-slate-900">
                  {activeCategory === 'Todos' ? 'Nuestra Colección Completa' : activeCategory}
                </h2>
                <span className="text-xs font-bold bg-rose-100 text-rose-900 px-2.5 py-0.5 rounded-full">
                  {filteredProducts.length} {filteredProducts.length === 1 ? 'producto' : 'productos'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Fragancias, hidratantes y cuidado personal para el día a día.
              </p>
            </div>

            {/* Sort Selector */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
                <SlidersHorizontal className="w-3.5 h-3.5 text-pink-500" />
                <span className="hidden sm:inline">Ordenar por:</span>
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                id="catalog-sort-select"
                className="px-3.5 py-2 rounded-2xl bg-rose-50/70 border border-rose-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-pink-400"
              >
                <option value="featured">✨ Destacados & Popular</option>
                <option value="price-asc">💵 Precio: Menor a Mayor</option>
                <option value="price-desc">💎 Precio: Mayor a Menor</option>
                <option value="name">🔤 Nombre Alfabético</option>
              </select>
            </div>
          </div>

          {/* Scent Notes Quick Filter Chips */}
          {allScentNotes.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none text-xs">
              <span className="text-slate-400 font-medium shrink-0">Filtrar por nota:</span>
              <button
                onClick={() => setSelectedScentFilter('Todos')}
                className={`px-3 py-1 rounded-full font-medium transition-all ${
                  selectedScentFilter === 'Todos'
                    ? 'bg-rose-900 text-white font-bold'
                    : 'bg-white text-slate-600 hover:bg-rose-50 border border-rose-100'
                }`}
              >
                Todas las Notas
              </button>
              {allScentNotes.map((scent) => {
                const isSelected = selectedScentFilter === scent;
                return (
                  <button
                    key={scent}
                    onClick={() => setSelectedScentFilter(scent)}
                    className={`px-3 py-1 rounded-full font-medium transition-all whitespace-nowrap ${
                      isSelected
                        ? 'bg-rose-900 text-white font-bold'
                        : 'bg-white text-slate-600 hover:bg-rose-50 border border-rose-100'
                    }`}
                  >
                    🌸 {scent}
                  </button>
                );
              })}
            </div>
          )}
        </section>

        {/* Product Cards Grid */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-rose-100 space-y-4 max-w-md mx-auto my-8 shadow-2xs">
            <div className="w-16 h-16 rounded-full bg-rose-50 text-pink-400 flex items-center justify-center mx-auto">
              <SearchX className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-serif font-bold text-slate-900">
                No encontramos productos
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                No hay resultados para la búsqueda "{searchQuery}" o los filtros seleccionados.
              </p>
            </div>
            <button
              onClick={() => {
                setSearchQuery('');
                setActiveCategory('Todos');
                setSelectedScentFilter('Todos');
              }}
              className="py-2.5 px-5 rounded-full bg-pink-500 text-white font-bold text-xs hover:bg-rose-600 transition-colors shadow-xs"
            >
              Restablecer Filtros
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onViewDetail={(p) => setSelectedProductDetail(p)}
                onEditProduct={(p) => {
                  setEditingProductFromCard(p);
                  setIsAdminDashboardOpen(true);
                }}
              />
            ))}
          </div>
        )}

      </main>

      {/* Footer */}
      <Footer
        onSelectCategory={(cat) => setActiveCategory(cat)}
        onOpenAdmin={handleOpenAdminPortal}
      />

      {/* MODALS & DRAWERS */}
      <ProductDetailModal
        product={selectedProductDetail}
        onClose={() => setSelectedProductDetail(null)}
        onOpenCart={() => setIsCartOpen(true)}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onOpenCheckout={() => setIsCheckoutOpen(true)}
      />

      <YappyCheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
      />

      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onSuccess={() => {
          setIsAdminLoginOpen(false);
          setIsAdminDashboardOpen(true);
        }}
      />

      {isAdminDashboardOpen && (
        <AdminDashboard onClose={() => setIsAdminDashboardOpen(false)} />
      )}
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <CatalogContent />
    </StoreProvider>
  );
}
