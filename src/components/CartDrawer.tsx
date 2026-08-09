import React from 'react';
import { X, Trash2, ShoppingBag, ArrowRight, Truck, Sparkles, Zap } from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  onOpenCheckout,
}) => {
  if (!isOpen) return null;

  const {
    cart,
    cartTotal,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    settings,
  } = useStore();

  const freeDeliveryThreshold = settings.freeDeliveryMin;
  const remainingForFreeDelivery = Math.max(0, freeDeliveryThreshold - cartTotal);
  const deliveryProgress = Math.min(100, (cartTotal / freeDeliveryThreshold) * 100);

  const deliveryFee = cartTotal >= freeDeliveryThreshold || cart.length === 0 ? 0 : settings.deliveryFeeDefault;
  const grandTotal = cartTotal + deliveryFee;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-xs flex justify-end">
      {/* Drawer Overlay */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Drawer Panel */}
      <div 
        className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-10 border-l border-rose-100 animate-in slide-in-from-right duration-300"
        id="cart-drawer-panel"
      >
        {/* Header */}
        <div className="p-5 border-b border-rose-100 flex items-center justify-between bg-rose-50/50">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-pink-500" />
            <h2 className="text-lg font-serif font-bold text-slate-900">
              Tu Carrito de Compras
            </h2>
          </div>
          <button
            onClick={onClose}
            id="close-cart-drawer-btn"
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Delivery Bar */}
        <div className="bg-pink-50/80 px-5 py-3 border-b border-rose-100 space-y-1.5">
          <div className="flex items-center justify-between text-xs font-semibold text-rose-900">
            <div className="flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-pink-500" />
              <span>
                {remainingForFreeDelivery > 0
                  ? `Agrega $${remainingForFreeDelivery.toFixed(2)} para Envío GRATIS`
                  : '¡Felicidades! Tienes Envío GRATIS'}
              </span>
            </div>
            <span>{Math.round(deliveryProgress)}%</span>
          </div>
          <div className="w-full h-2 bg-rose-200/60 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-pink-500 to-rose-600 transition-all duration-300 rounded-full"
              style={{ width: `${deliveryProgress}%` }}
            />
          </div>
        </div>

        {/* Item List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 divide-y divide-rose-50">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-12">
              <div className="w-20 h-20 rounded-full bg-rose-50 flex items-center justify-center text-pink-400">
                <ShoppingBag className="w-10 h-10" />
              </div>
              <div>
                <p className="text-base font-serif font-bold text-slate-800">
                  Tu carrito está vacío
                </p>
                <p className="text-xs text-slate-500 mt-1 max-w-xs">
                  Explora nuestro catálogo de perfumes, splash, cremas y jabones y añade tus favoritos.
                </p>
              </div>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.product.id} className="pt-4 first:pt-0 flex gap-4 items-center">
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  className="w-16 h-16 rounded-2xl object-cover border border-rose-100 shrink-0"
                />
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex justify-between items-start">
                    <h4 className="text-xs font-serif font-bold text-slate-900 truncate pr-2">
                      {item.product.name}
                    </h4>
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="text-slate-300 hover:text-rose-600 p-0.5 transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-500">
                    {item.selectedVolume || item.product.volume || item.product.category}
                  </p>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs font-bold text-slate-900">
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </span>

                    {/* Quantity controls */}
                    <div className="flex items-center border border-rose-200 rounded-lg bg-rose-50/50 p-0.5">
                      <button
                        onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                        className="w-5 h-5 rounded-md bg-white hover:bg-rose-100 text-slate-700 font-bold flex items-center justify-center text-xs shadow-2xs"
                      >
                        -
                      </button>
                      <span className="w-6 text-center text-xs font-bold text-slate-800">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                        className="w-5 h-5 rounded-md bg-white hover:bg-rose-100 text-slate-700 font-bold flex items-center justify-center text-xs shadow-2xs"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Summary & Checkout */}
        {cart.length > 0 && (
          <div className="p-5 border-t border-rose-100 bg-rose-50/30 space-y-3">
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal ({cart.reduce((s, i) => s + i.quantity, 0)} productos):</span>
                <span className="font-semibold text-slate-800">${cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Envío en Panamá:</span>
                <span className="font-semibold text-slate-800">
                  {deliveryFee === 0 ? (
                    <span className="text-emerald-600 font-bold uppercase">GRATIS</span>
                  ) : (
                    `$${deliveryFee.toFixed(2)}`
                  )}
                </span>
              </div>
              <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-rose-100">
                <span>Total a Pagar:</span>
                <span className="text-base text-rose-900 font-extrabold">${grandTotal.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={() => {
                onClose();
                onOpenCheckout();
              }}
              id="proceed-to-yappy-checkout-btn"
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-pink-200 flex items-center justify-center gap-2 transition-all active:scale-98"
            >
              <Zap className="w-4 h-4 text-amber-300" />
              <span>Proceder al Pago con Yappy</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={clearCart}
              id="clear-cart-btn"
              className="w-full text-center text-[11px] text-slate-400 hover:text-rose-600 transition-colors py-1"
            >
              Vaciar carrito
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
