import React, { useState } from 'react';
import { X, ShoppingBag, Sparkles, Check, Heart, Shield, Truck, Zap } from 'lucide-react';
import { Product } from '../types';
import { useStore } from '../context/StoreContext';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onOpenCart: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onOpenCart,
}) => {
  if (!product) return null;

  const { addToCart, settings } = useStore();
  const [quantity, setQuantity] = useState(1);
  const [addedSuccess, setAddedSuccess] = useState(false);

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setAddedSuccess(true);
    setTimeout(() => setAddedSuccess(false), 2000);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity);
    onClose();
    onOpenCart();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="relative bg-white rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl border border-rose-100 animate-in fade-in zoom-in-95 duration-200"
        id="product-detail-modal"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          id="close-detail-modal-btn"
          className="absolute top-4 right-4 z-20 bg-white/80 hover:bg-white text-slate-700 hover:text-slate-900 p-2 rounded-full shadow-md border border-slate-100 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Image Showcase */}
          <div className="relative bg-rose-50/60 aspect-square md:aspect-auto flex items-center justify-center p-6">
            <img
              src={product.image}
              alt={product.name}
              className="max-h-96 w-full object-cover rounded-2xl shadow-md border border-white"
            />
            {product.isBestSeller && (
              <span className="absolute top-4 left-4 bg-rose-900 text-white text-[10px] font-black uppercase px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-300" />
                Más Vendido
              </span>
            )}
          </div>

          {/* Details Content */}
          <div className="p-6 sm:p-8 flex flex-col justify-between space-y-5">
            <div>
              {/* Category & Volume */}
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider bg-rose-100 text-rose-900 px-3 py-0.5 rounded-full">
                  {product.category}
                </span>
                {product.volume && (
                  <span className="text-xs text-slate-500 font-medium">Contenido: {product.volume}</span>
                )}
              </div>

              {/* Name */}
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 leading-tight">
                {product.name}
              </h2>

              {/* Price */}
              <div className="mt-3 flex items-baseline gap-3">
                <span className="text-2xl font-extrabold text-slate-900">
                  ${product.price.toFixed(2)}
                </span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="text-sm text-slate-400 line-through">
                    ${product.originalPrice.toFixed(2)}
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="mt-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
                {product.description}
              </p>

              {/* Fragrance Notes / Ingredients */}
              {product.scentNotes && product.scentNotes.length > 0 && (
                <div className="mt-5 p-3.5 bg-rose-50/70 rounded-2xl border border-rose-100">
                  <p className="text-xs font-bold text-rose-900 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <span>🌸 Olfativa & Notas del Aroma</span>
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {product.scentNotes.map((note, index) => (
                      <span
                        key={index}
                        className="bg-white text-rose-800 text-xs font-semibold px-2.5 py-1 rounded-xl border border-rose-200/80 shadow-2xs"
                      >
                        {note}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Selector */}
              <div className="mt-6 flex items-center gap-4">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Cantidad:</span>
                <div className="flex items-center border border-rose-200 rounded-full bg-rose-50/50 p-1">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    id="qty-decrease-btn"
                    className="w-8 h-8 rounded-full bg-white hover:bg-rose-100 text-slate-700 font-bold flex items-center justify-center text-sm shadow-2xs"
                  >
                    -
                  </button>
                  <span className="w-10 text-center font-bold text-slate-900 text-sm">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    id="qty-increase-btn"
                    className="w-8 h-8 rounded-full bg-white hover:bg-rose-100 text-slate-700 font-bold flex items-center justify-center text-sm shadow-2xs"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3 pt-4 border-t border-rose-100">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  onClick={handleAddToCart}
                  disabled={!product.inStock}
                  id="modal-add-to-cart-btn"
                  className={`w-full py-3 px-4 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md ${
                    addedSuccess
                      ? 'bg-emerald-600 text-white'
                      : 'bg-rose-100 hover:bg-pink-200 text-rose-900 border border-pink-200'
                  }`}
                >
                  {addedSuccess ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>¡Añadido al Carrito!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4 text-pink-600" />
                      <span>Añadir al Carrito</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleBuyNow}
                  disabled={!product.inStock}
                  id="modal-buy-yappy-now-btn"
                  className="w-full py-3 px-4 rounded-2xl text-xs font-bold bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white shadow-md flex items-center justify-center gap-2 transition-all"
                >
                  <Zap className="w-4 h-4 text-amber-300" />
                  <span>Comprar por Yappy</span>
                </button>
              </div>

              {/* Guarantees */}
              <div className="flex items-center justify-around text-[11px] text-slate-500 pt-1">
                <div className="flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-pink-500" />
                  <span>Envío seguro en Panamá</span>
                </div>
                <div className="flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Producto 100% Original</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
