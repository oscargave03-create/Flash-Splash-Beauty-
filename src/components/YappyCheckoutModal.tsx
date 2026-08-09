import React, { useState } from 'react';
import { X, Check, Copy, ArrowRight, ShieldCheck, Upload, Phone, MapPin, Truck, Sparkles, Send, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useStore } from '../context/StoreContext';
import { Order } from '../types';

interface YappyCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const YappyCheckoutModal: React.FC<YappyCheckoutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const { cart, cartTotal, settings, createOrder } = useStore();

  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form State
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState<'domicilio' | 'pickup'>('domicilio');
  const [notes, setNotes] = useState('');

  // Province Shipping Fee State
  const provinceList = settings.provinceFees || [];
  const [selectedProvinceId, setSelectedProvinceId] = useState<string>(() => provinceList[0]?.id || '');
  const selectedProvince = provinceList.find((p) => p.id === selectedProvinceId) || provinceList[0];

  // Yappy Payment State
  const [yappyRefNumber, setYappyRefNumber] = useState('');
  const [paymentProofUrl, setPaymentProofUrl] = useState<string | null>(null);
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);

  const activeFee = selectedProvince ? selectedProvince.fee : settings.deliveryFeeDefault;
  const deliveryFee = deliveryMethod === 'pickup' || cartTotal >= settings.freeDeliveryMin ? 0 : activeFee;
  const grandTotal = cartTotal + deliveryFee;

  const handleCopyPhone = () => {
    navigator.clipboard.writeText(settings.yappyPhone.replace(/\s+/g, ''));
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPaymentProofUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone || !deliveryAddress) {
      alert('Por favor completa todos los campos requeridos de contacto y entrega.');
      return;
    }
    if (!yappyRefNumber) {
      alert('Por favor ingresa el número de referencia o confirmación de Yappy.');
      return;
    }

    setIsSubmitting(true);

    const fullAddress = deliveryMethod === 'domicilio' && selectedProvince
      ? `[${selectedProvince.provinceName}] ${deliveryAddress}`
      : deliveryAddress;

    try {
      const order = await createOrder({
        customerName,
        customerPhone,
        customerEmail: customerEmail || undefined,
        deliveryAddress: fullAddress,
        deliveryMethod,
        notes: notes || undefined,
        items: cart.map((i) => ({
          productId: i.product.id,
          productName: i.product.name,
          price: i.product.price,
          quantity: i.quantity,
          volume: i.selectedVolume || i.product.volume,
          image: i.product.image,
        })),
        subtotal: cartTotal,
        deliveryFee,
        total: grandTotal,
        yappyRefNumber,
        paymentProofUrl: paymentProofUrl || undefined,
      });

      setCreatedOrder(order);
      setStep(3);
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (err) {
      console.error(err);
      alert('Error al registrar la transacción. Por favor reintenta.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendWhatsAppConfirmation = () => {
    if (!createdOrder) return;

    const phoneClean = settings.whatsappPhone.replace(/\D/g, '');
    const itemsList = createdOrder.items
      .map((i) => `• ${i.quantity}x ${i.productName} ($${i.price.toFixed(2)})`)
      .join('\n');

    const message = `Hola *${settings.storeName}*, acabo de realizar un pedido por Yappy! 🎉

📌 *Pedido ID:* #${createdOrder.id}
👤 *Cliente:* ${createdOrder.customerName}
📞 *Teléfono:* ${createdOrder.customerPhone}
📍 *Entrega:* ${createdOrder.deliveryAddress} (${createdOrder.deliveryMethod})

🛒 *Productos:*
${itemsList}

💰 *Total:* $${createdOrder.total.toFixed(2)}
💳 *Ref Yappy:* ${createdOrder.yappyRefNumber}

Solicito confirmación de mi envío. ¡Gracias!`;

    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${phoneClean}?text=${encoded}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="relative bg-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl border border-rose-100 animate-in fade-in zoom-in-95 duration-200"
        id="yappy-checkout-modal"
      >
        {/* Modal Header */}
        <div className="p-5 bg-gradient-to-r from-pink-500 via-rose-500 to-rose-600 text-white flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-pink-100 bg-white/20 px-2.5 py-0.5 rounded-full">
              {step === 3 ? '¡Pedido Confirmado!' : 'Pago Seguro por Yappy'}
            </span>
            <h3 className="text-xl font-serif font-bold mt-1">
              {step === 1 && '1. Datos de Envío & Contacto'}
              {step === 2 && '2. Pago por Yappy & Comprobante'}
              {step === 3 && '3. ¡Transacción Registrada!'}
            </h3>
          </div>
          <button
            onClick={onClose}
            id="close-checkout-modal-btn"
            className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator */}
        {step !== 3 && (
          <div className="flex border-b border-rose-100 bg-rose-50/50 text-xs font-semibold text-slate-600">
            <button
              onClick={() => setStep(1)}
              className={`flex-1 py-2.5 text-center transition-colors ${
                step === 1 ? 'border-b-2 border-pink-500 text-rose-900 font-bold bg-white' : ''
              }`}
            >
              1. Datos de Envío
            </button>
            <button
              onClick={() => {
                if (customerName && customerPhone && deliveryAddress) setStep(2);
              }}
              className={`flex-1 py-2.5 text-center transition-colors ${
                step === 2 ? 'border-b-2 border-pink-500 text-rose-900 font-bold bg-white' : ''
              }`}
            >
              2. Pago Yappy
            </button>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6">
          {/* STEP 1: CUSTOMER INFO */}
          {step === 1 && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setStep(2);
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Ej: María González"
                  id="checkout-name-input"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-rose-200 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Teléfono / WhatsApp *
                  </label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="Ej: +507 6234-5678"
                    id="checkout-phone-input"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-rose-200 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Correo Electrónico (Opcional)
                  </label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="maria@ejemplo.com"
                    id="checkout-email-input"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-rose-200 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Método de Entrega
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setDeliveryMethod('domicilio')}
                    className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition-all ${
                      deliveryMethod === 'domicilio'
                        ? 'border-pink-500 bg-pink-50/80 text-rose-900 font-bold'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Truck className="w-4 h-4 text-pink-500" />
                    <div>
                      <p className="text-xs font-bold">Envío a Domicilio</p>
                      <p className="text-[10px] text-slate-500">
                        {selectedProvince ? `$${selectedProvince.fee.toFixed(2)} (${selectedProvince.provinceName})` : '+$3.50'}
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeliveryMethod('pickup')}
                    className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition-all ${
                      deliveryMethod === 'pickup'
                        ? 'border-pink-500 bg-pink-50/80 text-rose-900 font-bold'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <MapPin className="w-4 h-4 text-pink-500" />
                    <div>
                      <p className="text-xs font-bold">Retiro Personal</p>
                      <p className="text-[10px] text-slate-500">Gratis en sucursal</p>
                    </div>
                  </button>
                </div>
              </div>

              {deliveryMethod === 'domicilio' && (
                <div className="bg-rose-50/60 p-3.5 rounded-2xl border border-rose-100 space-y-2">
                  <label className="block text-xs font-bold text-slate-800">
                    Provincia / Zona de Panamá *
                  </label>
                  <select
                    value={selectedProvinceId}
                    onChange={(e) => setSelectedProvinceId(e.target.value)}
                    id="checkout-province-select"
                    className="w-full px-3.5 py-2 rounded-xl border border-rose-200 text-xs font-bold bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-pink-400"
                  >
                    {provinceList.map((prov) => (
                      <option key={prov.id} value={prov.id}>
                        {prov.provinceName} — ${prov.fee.toFixed(2)} {prov.estimatedTime ? `(${prov.estimatedTime})` : ''}
                      </option>
                    ))}
                  </select>

                  {selectedProvince && (
                    <div className="flex items-center justify-between text-[11px] text-rose-900 font-medium pt-1">
                      <span>Tarifa {selectedProvince.provinceName}:</span>
                      <span className="font-extrabold">
                        {cartTotal >= settings.freeDeliveryMin ? (
                          <span className="text-emerald-600 font-bold">¡ENVÍO GRATIS!</span>
                        ) : (
                          `$${selectedProvince.fee.toFixed(2)} ${selectedProvince.estimatedTime ? `• ${selectedProvince.estimatedTime}` : ''}`
                        )}
                      </span>
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Dirección o Punto de Entrega en Panamá *
                </label>
                <textarea
                  required
                  rows={2}
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="Ej: San Francisco, Edificio Plaza Sol, Apto 4B, Ciudad de Panamá"
                  id="checkout-address-input"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-rose-200 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Notas para el pedido (Opcional)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ej: Empacar para regalo de cumpleaños"
                  id="checkout-notes-input"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-rose-200 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
                />
              </div>

              <div className="pt-3 border-t border-rose-100 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-500">Total a Pagar:</span>
                  <p className="text-lg font-extrabold text-rose-900">${grandTotal.toFixed(2)}</p>
                </div>
                <button
                  type="submit"
                  id="continue-to-yappy-step-btn"
                  className="py-3 px-6 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white text-xs font-bold shadow-md flex items-center gap-2 transition-all"
                >
                  <span>Continuar a Pago Yappy</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: YAPPY PAYMENT INSTRUCTIONS & REFERENCE INPUT */}
          {step === 2 && (
            <form onSubmit={handleSubmitOrder} className="space-y-5">
              {/* Yappy Instruction Box */}
              <div className="bg-sky-50 border-2 border-sky-200 rounded-3xl p-4 sm:p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-sky-500 text-white font-extrabold flex items-center justify-center text-sm shadow-xs">
                      Y
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-sky-950">Pago por Yappy Panamá</h4>
                      <p className="text-[11px] text-sky-700">Abre tu app Banco General o Yappy</p>
                    </div>
                  </div>
                  <span className="text-xs font-extrabold bg-sky-600 text-white px-2.5 py-1 rounded-full shadow-2xs">
                    ${grandTotal.toFixed(2)}
                  </span>
                </div>

                {/* Yappy Details Card */}
                <div className="bg-white rounded-2xl p-3 border border-sky-100 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Titular de Cuenta:</span>
                    <span className="font-bold text-slate-800">{settings.yappyName}</span>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                    <span className="text-slate-500">Número de Celular Yappy:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-extrabold text-sky-700 text-sm">
                        {settings.yappyPhone}
                      </span>
                      <button
                        type="button"
                        onClick={handleCopyPhone}
                        className="bg-sky-100 hover:bg-sky-200 text-sky-800 p-1 rounded-lg transition-colors flex items-center gap-1 text-[10px] font-bold"
                      >
                        {copiedPhone ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedPhone ? '¡Copiado!' : 'Copiar'}</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-sky-800 leading-relaxed bg-sky-100/60 p-2.5 rounded-xl">
                  💡 <strong>Instrucciones:</strong> Abre tu Yappy, envía <strong>${grandTotal.toFixed(2)}</strong> al número <strong>{settings.yappyPhone}</strong> e ingresa abajo el número de confirmación o adjunta la captura del pago.
                </div>
              </div>

              {/* Yappy Confirmation Reference Input */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Número de Confirmación / Referencia Yappy *
                </label>
                <input
                  type="text"
                  required
                  value={yappyRefNumber}
                  onChange={(e) => setYappyRefNumber(e.target.value)}
                  placeholder="Ej: Ref 98452109"
                  id="yappy-ref-input"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-rose-200 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 font-mono"
                />
              </div>

              {/* Payment Proof Photo Upload */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Adjuntar Comprobante de Pago (Foto / Screenshot)
                </label>
                <div className="relative border-2 border-dashed border-rose-200 rounded-2xl p-4 text-center hover:border-pink-400 transition-colors bg-rose-50/30">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    id="payment-proof-upload-input"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  {paymentProofUrl ? (
                    <div className="flex flex-col items-center gap-2">
                      <img
                        src={paymentProofUrl}
                        alt="Comprobante Yappy"
                        className="h-24 object-contain rounded-xl border border-pink-200 shadow-sm"
                      />
                      <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Comprobante adjuntado correctamente
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <Upload className="w-6 h-6 text-pink-400 mx-auto" />
                      <p className="text-xs font-medium text-slate-700">
                        Haz clic o arrastra la captura de pantalla de Yappy
                      </p>
                      <p className="text-[10px] text-slate-400">PNG, JPG o WEBP</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="py-2.5 px-4 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition-colors"
                >
                  Volver a Datos
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  id="submit-yappy-order-btn"
                  className="py-3 px-6 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white text-xs font-bold shadow-md flex items-center gap-2 transition-all"
                >
                  {isSubmitting ? (
                    <span>Registrando pedido...</span>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-amber-300" />
                      <span>Confirmar & Registrar Pedido</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: ORDER SUCCESS RECEIPT */}
          {step === 3 && createdOrder && (
            <div className="text-center space-y-5 py-2">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <h4 className="text-xl font-serif font-bold text-slate-900">
                  ¡Gracias por tu compra, {createdOrder.customerName}!
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Tu pedido <strong>#{createdOrder.id}</strong> ha sido registrado con éxito en nuestra base de datos.
                </p>
              </div>

              {/* Summary Card */}
              <div className="bg-rose-50/80 rounded-2xl p-4 text-left border border-rose-100 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Monto Total:</span>
                  <span className="font-extrabold text-rose-900">${createdOrder.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Referencia Yappy:</span>
                  <span className="font-mono font-bold text-slate-800">{createdOrder.yappyRefNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Entrega:</span>
                  <span className="font-bold text-slate-800">{createdOrder.deliveryAddress}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Estado:</span>
                  <span className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full font-bold text-[10px]">
                    Verificando Yappy
                  </span>
                </div>
              </div>

              {/* WhatsApp Action Button */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={handleSendWhatsAppConfirmation}
                  id="send-whatsapp-receipt-btn"
                  className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 transition-all"
                >
                  <Send className="w-4 h-4" />
                  <span>Enviar Confirmación por WhatsApp</span>
                </button>

                <button
                  onClick={onClose}
                  className="w-full py-2.5 px-4 rounded-2xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition-colors"
                >
                  Cerrar y seguir comprando
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
