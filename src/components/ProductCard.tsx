import React from 'react';
import { ShoppingBag, Eye, Edit, Sparkles, Heart, Check } from 'lucide-react';
import { Product } from '../types';
import { useStore } from '../context/StoreContext';

interface ProductCardProps {
  product: Product;
  onViewDetail: (product: Product) => void;
  onEditProduct?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onViewDetail, onEditProduct }) => {
  const { addToCart, isAdminLoggedIn } = useStore();
  const [addedAnimation, setAddedAnimation] = React.useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, 1);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1200);
  };

  const discountPercent = product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div
      onClick={() => onViewDetail(product)}
      id={`product-card-${product.id}`}
      className="group relative bg-white rounded-3xl overflow-hidden border border-rose-100 hover:border-pink-300 shadow-2xs hover:shadow-xl transition-all duration-300 flex flex-col cursor-pointer"
    >
      {/* Image Container */}
      <div className="relative aspect-square w-full bg-rose-50/50 overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />

        {/* Badges Overlay */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {product.isBestSeller && (
            <span className="bg-rose-900 text-white text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full shadow-xs flex items-center gap-1 tracking-wider">
              <Sparkles className="w-3 h-3 text-amber-300" />
              Más Vendido
            </span>
          )}
          {product.isNew && (
            <span className="bg-gradient-to-r from-pink-500 to-rose-500 text-white text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full shadow-xs tracking-wider">
              Nuevo
            </span>
          )}
          {discountPercent > 0 && (
            <span className="bg-amber-500 text-slate-900 text-[10px] font-black uppercase px-2 py-0.5 rounded-full shadow-xs">
              -{discountPercent}%
            </span>
          )}
        </div>

        {/* Admin Edit Floating Shortcut */}
        {isAdminLoggedIn && onEditProduct && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEditProduct(product);
            }}
            id={`admin-edit-prod-${product.id}`}
            className="absolute top-3 right-3 z-20 bg-slate-900 text-white p-2 rounded-full shadow-md hover:bg-pink-600 transition-colors"
            title="Editar producto (Admin)"
          >
            <Edit className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Stock Badge */}
        {!product.inStock && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-xs flex items-center justify-center z-20">
            <span className="bg-slate-900 text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-md">
              Agotado
            </span>
          </div>
        )}

        {/* Quick View Floating Button on Hover */}
        <div className="absolute inset-x-3 bottom-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hidden sm:flex items-center justify-center">
          <span className="bg-white/95 backdrop-blur-sm text-rose-900 text-xs font-bold px-3.5 py-2 rounded-full shadow-md flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-pink-500" />
            Ver Detalles
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Category & Volume */}
          <div className="flex items-center justify-between text-[11px] text-pink-600 font-semibold mb-1">
            <span className="uppercase tracking-wider font-bold bg-rose-50 text-rose-800 px-2.5 py-0.5 rounded-full">
              {product.category}
            </span>
            {product.volume && <span className="text-slate-400 font-medium">{product.volume}</span>}
          </div>

          {/* Title */}
          <h3 className="text-base font-serif font-bold text-slate-900 group-hover:text-rose-900 transition-colors line-clamp-1">
            {product.name}
          </h3>

          {/* Fragrance Scent Notes Tags */}
          {product.scentNotes && product.scentNotes.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {product.scentNotes.slice(0, 3).map((note, idx) => (
                <span
                  key={idx}
                  className="text-[10px] bg-slate-50 text-slate-600 px-2 py-0.5 rounded-md border border-slate-100"
                >
                  🌸 {note}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Price & Add to Cart Action */}
        <div className="pt-2 border-t border-rose-50 flex items-center justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-extrabold text-slate-900">
                ${product.price.toFixed(2)}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-xs text-slate-400 line-through">
                  ${product.originalPrice.toFixed(2)}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={!product.inStock}
            id={`add-to-cart-btn-${product.id}`}
            className={`px-3.5 py-2 rounded-2xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs ${
              addedAnimation
                ? 'bg-emerald-600 text-white'
                : product.inStock
                ? 'bg-pink-500 hover:bg-rose-600 text-white active:scale-95 shadow-pink-200'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            {addedAnimation ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>¡Añadido!</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Agregar</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
