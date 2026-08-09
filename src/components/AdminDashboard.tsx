import React, { useState } from 'react';
import { 
  Package, ShoppingBag, Settings, Database, LogOut, Plus, Edit2, Trash2, 
  Check, X, Eye, ExternalLink, RefreshCw, Copy, CheckCircle2, ShieldCheck, 
  AlertCircle, Sparkles, Filter, Phone, MapPin, Upload, Tags, Truck, Image,
  User, Lock, EyeOff, Key
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Product, Order, OrderStatus, ProductCategory } from '../types';
import { SUPABASE_SQL_SCHEMA } from '../lib/supabase';

interface AdminDashboardProps {
  onClose: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onClose }) => {
  const {
    products,
    orders,
    settings,
    supabaseConfig,
    adminUser,
    addProduct,
    updateProduct,
    deleteProduct,
    updateOrderStatus,
    deleteOrder,
    updateSettings,
    addCategory,
    renameCategory,
    deleteCategory,
    addProvinceFee,
    updateProvinceFee,
    deleteProvinceFee,
    saveSupabaseCredentials,
    logoutAdmin,
    updateAdminCredentials,
    syncWithSupabase,
  } = useStore();

  const [activeTab, setActiveTab] = useState<'products' | 'categories' | 'shipping' | 'banner' | 'orders' | 'settings' | 'supabase'>('products');

  // Product Form Modal State
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  const [prodName, setProdName] = useState('');
  const [prodCategory, setProdCategory] = useState<ProductCategory>('Perfumes');
  const [prodPrice, setProdPrice] = useState('');
  const [prodOriginalPrice, setProdOriginalPrice] = useState('');
  const [prodDescription, setProdDescription] = useState('');
  const [prodScentNotes, setProdScentNotes] = useState('');
  const [prodVolume, setProdVolume] = useState('');
  const [prodImage, setProdImage] = useState('');
  const [prodInStock, setProdInStock] = useState(true);
  const [prodIsBestSeller, setProdIsBestSeller] = useState(false);
  const [prodIsNew, setProdIsNew] = useState(false);

  // Settings State
  const [storeName, setStoreName] = useState(settings.storeName);
  const [storeTagline, setStoreTagline] = useState(settings.storeTagline);
  const [storeLogoUrl, setStoreLogoUrl] = useState(settings.storeLogoUrl || '');
  const [heroBadgeText, setHeroBadgeText] = useState(settings.heroBadgeText || 'Colección Exclusiva de Belleza & Fragancias');
  const [heroTitle, setHeroTitle] = useState(settings.heroTitle || 'Descubre la fragancia que enamora tu estilo');
  const [heroSubtitle, setHeroSubtitle] = useState(settings.heroSubtitle || 'Perfumes finos, mists ligeros, cremas hidratantes, lociones de sedas y jabones artesanales. Paga directo y seguro mediante Yappy con envíos directos en todo Panamá.');
  const [heroImageUrl, setHeroImageUrl] = useState(settings.heroImageUrl || 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=600');
  const [yappyPhone, setYappyPhone] = useState(settings.yappyPhone);
  const [yappyName, setYappyName] = useState(settings.yappyName);
  const [whatsappPhone, setWhatsappPhone] = useState(settings.whatsappPhone);
  const [deliveryFee, setDeliveryFee] = useState(settings.deliveryFeeDefault.toString());
  const [freeDeliveryMin, setFreeDeliveryMin] = useState(settings.freeDeliveryMin.toString());
  const [announcementText, setAnnouncementText] = useState(settings.announcementText);
  const [settingsSavedMsg, setSettingsSavedMsg] = useState('');

  // Admin Credentials Form State
  const [adminUsername, setAdminUsername] = useState(adminUser.username || 'Angela28');
  const [adminPassword, setAdminPassword] = useState(adminUser.password || '1234578');
  const [showAdminPass, setShowAdminPass] = useState(false);
  const [adminCredSavedMsg, setAdminCredSavedMsg] = useState('');


  // Category Editing State
  const [newCatName, setNewCatName] = useState('');
  const [editingCatOld, setEditingCatOld] = useState<string | null>(null);
  const [editingCatNew, setEditingCatNew] = useState('');

  // Province Fee Editing State
  const [newProvName, setNewProvName] = useState('');
  const [newProvFee, setNewProvFee] = useState('');
  const [newProvTime, setNewProvTime] = useState('24-48 horas');

  // Supabase Credentials State
  const [spUrl, setSpUrl] = useState(supabaseConfig.url);
  const [spKey, setSpKey] = useState(supabaseConfig.anonKey);
  const [spTesting, setSpTesting] = useState(false);
  const [spMessage, setSpMessage] = useState<{ success: boolean; text: string } | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);

  // Order Details Modal
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const [orderFilterStatus, setOrderFilterStatus] = useState<OrderStatus | 'todos'>('todos');

  // Open modal for NEW product
  const handleOpenNewProduct = () => {
    setEditingProduct(null);
    setProdName('');
    setProdCategory('Perfumes');
    setProdPrice('');
    setProdOriginalPrice('');
    setProdDescription('');
    setProdScentNotes('');
    setProdVolume('100 ml');
    setProdImage('https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=800');
    setProdInStock(true);
    setProdIsBestSeller(false);
    setProdIsNew(true);
    setIsProductModalOpen(true);
  };

  // Open modal for EDIT product
  const handleOpenEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setProdName(prod.name);
    setProdCategory(prod.category);
    setProdPrice(prod.price.toString());
    setProdOriginalPrice(prod.originalPrice ? prod.originalPrice.toString() : '');
    setProdDescription(prod.description);
    setProdScentNotes(prod.scentNotes ? prod.scentNotes.join(', ') : '');
    setProdVolume(prod.volume || '');
    setProdImage(prod.image);
    setProdInStock(prod.inStock);
    setProdIsBestSeller(Boolean(prod.isBestSeller));
    setProdIsNew(Boolean(prod.isNew));
    setIsProductModalOpen(true);
  };

  // Handle Product Save
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName || !prodPrice || !prodDescription || !prodImage) {
      alert('Por favor completa los campos requeridos (Nombre, Precio, Descripción, Imagen)');
      return;
    }

    const notesArray = prodScentNotes
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const productPayload = {
      name: prodName,
      category: prodCategory,
      price: parseFloat(prodPrice),
      originalPrice: prodOriginalPrice ? parseFloat(prodOriginalPrice) : undefined,
      description: prodDescription,
      scentNotes: notesArray,
      volume: prodVolume || undefined,
      image: prodImage,
      inStock: prodInStock,
      isBestSeller: prodIsBestSeller,
      isNew: prodIsNew,
    };

    if (editingProduct) {
      await updateProduct({
        ...editingProduct,
        ...productPayload,
      });
    } else {
      await addProduct(productPayload);
    }

    setIsProductModalOpen(false);
  };

  // Handle Product Photo File Local Preview
  const handlePhotoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProdImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Logo File Upload
  const handleLogoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setStoreLogoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Hero Image File Upload
  const handleHeroFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setHeroImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateSettings({
      storeName,
      storeTagline,
      storeLogoUrl,
      heroBadgeText,
      heroTitle,
      heroSubtitle,
      heroImageUrl,
      yappyPhone,
      yappyName,
      whatsappPhone,
      deliveryFeeDefault: parseFloat(deliveryFee) || 3.5,
      freeDeliveryMin: parseFloat(freeDeliveryMin) || 50.0,
      currencySymbol: '$',
      announcementText,
      categories: settings.categories,
      provinceFees: settings.provinceFees,
    });
    setSettingsSavedMsg('Configuración guardada correctamente.');
    setTimeout(() => setSettingsSavedMsg(''), 3000);
  };

  // Handle Save Admin Credentials
  const handleSaveAdminCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await updateAdminCredentials(adminUsername, adminPassword);
    setAdminCredSavedMsg(res.message);
    setTimeout(() => setAdminCredSavedMsg(''), 4000);
  };

  // Category Actions
  const handleAddCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    await addCategory(newCatName.trim());
    setNewCatName('');
  };

  const handleRenameCategorySubmit = async (oldName: string) => {
    if (!editingCatNew.trim() || editingCatNew.trim() === oldName) {
      setEditingCatOld(null);
      return;
    }
    await renameCategory(oldName, editingCatNew.trim());
    setEditingCatOld(null);
    setEditingCatNew('');
  };

  // Province Shipping Fee Actions
  const handleAddProvinceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProvName.trim()) return;
    const feeNum = parseFloat(newProvFee) || 3.50;
    await addProvinceFee(newProvName.trim(), feeNum, newProvTime || '24-48 horas');
    setNewProvName('');
    setNewProvFee('');
    setNewProvTime('24-48 horas');
  };

  // Handle Save Supabase Config
  const handleSaveSupabaseConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setSpTesting(true);
    setSpMessage(null);

    const res = await saveSupabaseCredentials(spUrl, spKey);
    setSpTesting(false);
    setSpMessage({
      success: res.success,
      text: res.message,
    });
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  const filteredOrders = orders.filter((o) =>
    orderFilterStatus === 'todos' ? true : o.status === orderFilterStatus
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
      <div 
        className="relative bg-white rounded-3xl w-full max-w-6xl h-[92vh] shadow-2xl flex flex-col overflow-hidden border border-rose-100"
        id="admin-dashboard-container"
      >
        {/* Top Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-pink-500/20 text-pink-400 border border-pink-500/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-serif font-bold">Panel de Administración</h2>
              <p className="text-xs text-slate-400">Gestión de Catálogo, Pedidos Yappy & Base de Datos</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={syncWithSupabase}
              id="admin-sync-db-btn"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
              title="Sincronizar con Supabase"
            >
              <RefreshCw className="w-3.5 h-3.5 text-pink-400" />
              <span>Sincronizar DB</span>
            </button>

            <button
              onClick={() => {
                logoutAdmin();
                onClose();
              }}
              id="admin-logout-btn"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-900/80 hover:bg-rose-900 text-rose-100 text-xs font-bold transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Salir</span>
            </button>

            <button
              onClick={onClose}
              id="admin-close-btn"
              className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="bg-slate-100 border-b border-slate-200 px-6 flex items-center gap-2 overflow-x-auto shrink-0">
          <button
            onClick={() => setActiveTab('products')}
            id="tab-btn-products"
            className={`py-3 px-4 font-bold text-xs flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'products'
                ? 'border-pink-500 text-rose-900 bg-white shadow-2xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Package className="w-4 h-4 text-pink-500" />
            <span>Productos ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('categories')}
            id="tab-btn-categories"
            className={`py-3 px-4 font-bold text-xs flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'categories'
                ? 'border-pink-500 text-rose-900 bg-white shadow-2xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Tags className="w-4 h-4 text-pink-500" />
            <span>Categorías ({settings.categories?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('shipping')}
            id="tab-btn-shipping"
            className={`py-3 px-4 font-bold text-xs flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'shipping'
                ? 'border-pink-500 text-rose-900 bg-white shadow-2xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Truck className="w-4 h-4 text-pink-500" />
            <span>Envíos por Provincia ({settings.provinceFees?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('banner')}
            id="tab-btn-banner"
            className={`py-3 px-4 font-bold text-xs flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'banner'
                ? 'border-pink-500 text-rose-900 bg-white shadow-2xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4 text-pink-500" />
            <span>Portada / Banner</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            id="tab-btn-orders"
            className={`py-3 px-4 font-bold text-xs flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'orders'
                ? 'border-pink-500 text-rose-900 bg-white shadow-2xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShoppingBag className="w-4 h-4 text-pink-500" />
            <span>Transacciones Yappy ({orders.length})</span>
            {orders.filter((o) => o.status === 'pendiente_yappy').length > 0 && (
              <span className="bg-amber-500 text-slate-900 font-extrabold text-[10px] px-2 py-0.5 rounded-full">
                {orders.filter((o) => o.status === 'pendiente_yappy').length} nuevos
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            id="tab-btn-settings"
            className={`py-3 px-4 font-bold text-xs flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'settings'
                ? 'border-pink-500 text-rose-900 bg-white shadow-2xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Settings className="w-4 h-4 text-pink-500" />
            <span>Ajustes de Tienda</span>
          </button>

          <button
            onClick={() => setActiveTab('supabase')}
            id="tab-btn-supabase"
            className={`py-3 px-4 font-bold text-xs flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'supabase'
                ? 'border-pink-500 text-rose-900 bg-white shadow-2xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Database className="w-4 h-4 text-emerald-600" />
            <span>Base de Datos Supabase</span>
            {supabaseConfig.isConnected ? (
              <span className="w-2 h-2 rounded-full bg-emerald-500" title="Conectado" />
            ) : (
              <span className="w-2 h-2 rounded-full bg-amber-400" title="Local Fallback" />
            )}
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
          {/* TAB 1: PRODUCTS MANAGEMENT */}
          {activeTab === 'products' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-rose-100 shadow-2xs">
                <div>
                  <h3 className="text-base font-serif font-bold text-slate-900">Catálogo de Productos</h3>
                  <p className="text-xs text-slate-500">Agrega, edita fotos, precios y disponibilidad de tu tienda.</p>
                </div>

                <button
                  onClick={handleOpenNewProduct}
                  id="add-new-product-btn"
                  className="py-2.5 px-4 rounded-xl bg-pink-500 hover:bg-rose-600 text-white font-bold text-xs shadow-md flex items-center gap-2 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Agregar Nuevo Producto</span>
                </button>
              </div>

              {/* Products Table */}
              <div className="bg-white rounded-2xl border border-rose-100 shadow-2xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-rose-50/60 text-[11px] font-bold uppercase text-rose-900 tracking-wider border-b border-rose-100">
                        <th className="p-4">Producto</th>
                        <th className="p-4">Categoría</th>
                        <th className="p-4">Precio</th>
                        <th className="p-4">Estado</th>
                        <th className="p-4">Etiquetas</th>
                        <th className="p-4 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-rose-50 text-xs">
                      {products.map((p) => (
                        <tr key={p.id} className="hover:bg-rose-50/30 transition-colors">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={p.image}
                                alt={p.name}
                                className="w-12 h-12 rounded-xl object-cover border border-rose-100 shrink-0"
                              />
                              <div>
                                <p className="font-serif font-bold text-slate-900">{p.name}</p>
                                <p className="text-[11px] text-slate-500 truncate max-w-xs">{p.description}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="bg-rose-100 text-rose-900 font-bold text-[10px] uppercase px-2.5 py-0.5 rounded-full">
                              {p.category}
                            </span>
                          </td>
                          <td className="p-4 font-bold text-slate-900">
                            ${p.price.toFixed(2)}
                            {p.originalPrice && (
                              <span className="text-[10px] text-slate-400 line-through ml-1">
                                ${p.originalPrice.toFixed(2)}
                              </span>
                            )}
                          </td>
                          <td className="p-4">
                            <button
                              onClick={() => updateProduct({ ...p, inStock: !p.inStock })}
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase transition-colors ${
                                p.inStock
                                  ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                  : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                              }`}
                            >
                              {p.inStock ? 'En Stock' : 'Agotado'}
                            </button>
                          </td>
                          <td className="p-4">
                            <div className="flex flex-wrap gap-1">
                              {p.isBestSeller && (
                                <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-md">
                                  Más Vendido
                                </span>
                              )}
                              {p.isNew && (
                                <span className="bg-pink-100 text-pink-900 text-[10px] font-bold px-2 py-0.5 rounded-md">
                                  Nuevo
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleOpenEditProduct(p)}
                                id={`edit-prod-btn-${p.id}`}
                                className="p-1.5 rounded-lg bg-slate-100 hover:bg-pink-100 text-slate-700 hover:text-pink-600 transition-colors"
                                title="Editar"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(`¿Eliminar el producto "${p.name}"?`)) {
                                    deleteProduct(p.id);
                                  }
                                }}
                                id={`delete-prod-btn-${p.id}`}
                                className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-100 text-slate-700 hover:text-rose-600 transition-colors"
                                title="Eliminar"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB: CATEGORIES MANAGEMENT */}
          {activeTab === 'categories' && (
            <div className="max-w-3xl mx-auto bg-white rounded-2xl p-6 border border-rose-100 shadow-2xs space-y-6">
              <div>
                <h3 className="text-base font-serif font-bold text-slate-900 flex items-center gap-2">
                  <Tags className="w-5 h-5 text-pink-500" />
                  <span>Gestión de Categorías del Catálogo</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Agrega, renombrar o eliminar categorías. Al cambiar el nombre de una categoría, se actualizará automáticamente en los productos asociados.
                </p>
              </div>

              {/* Add New Category Form */}
              <form onSubmit={handleAddCategorySubmit} className="flex gap-2">
                <input
                  type="text"
                  required
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="Ej: Velas Aromáticas, Sets de Regalo..."
                  className="flex-1 px-3.5 py-2.5 rounded-xl border border-rose-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-pink-400"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-pink-500 hover:bg-rose-600 text-white text-xs font-bold shadow-md flex items-center gap-1.5 transition-all shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Agregar Categoría</span>
                </button>
              </form>

              {/* List of Categories */}
              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">Categorías Activas ({settings.categories?.length || 0})</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(settings.categories || []).map((cat) => {
                    const prodCount = products.filter((p) => p.category === cat).length;
                    const isEditing = editingCatOld === cat;

                    return (
                      <div key={cat} className="p-3.5 rounded-2xl bg-rose-50/50 border border-rose-100 flex items-center justify-between gap-3">
                        {isEditing ? (
                          <div className="flex items-center gap-2 flex-1">
                            <input
                              type="text"
                              value={editingCatNew}
                              onChange={(e) => setEditingCatNew(e.target.value)}
                              className="flex-1 px-3 py-1 rounded-lg border border-pink-400 text-xs font-bold bg-white"
                              autoFocus
                            />
                            <button
                              onClick={() => handleRenameCategorySubmit(cat)}
                              className="p-1.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"
                              title="Guardar"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setEditingCatOld(null)}
                              className="p-1.5 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300"
                              title="Cancelar"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <>
                            <div>
                              <p className="text-xs font-extrabold text-slate-900">{cat}</p>
                              <p className="text-[10px] text-slate-500">{prodCount} productos registrados</p>
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => {
                                  setEditingCatOld(cat);
                                  setEditingCatNew(cat);
                                }}
                                className="p-1.5 rounded-lg bg-white hover:bg-pink-100 text-slate-700 hover:text-pink-600 border border-rose-100 transition-colors"
                                title="Renombrar Categoría"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(`¿Eliminar la categoría "${cat}"?`)) {
                                    deleteCategory(cat);
                                  }
                                }}
                                className="p-1.5 rounded-lg bg-white hover:bg-rose-100 text-slate-700 hover:text-rose-600 border border-rose-100 transition-colors"
                                title="Eliminar Categoría"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB: PROVINCE SHIPPING FEES MANAGEMENT */}
          {activeTab === 'shipping' && (
            <div className="max-w-4xl mx-auto bg-white rounded-2xl p-6 border border-rose-100 shadow-2xs space-y-6">
              <div>
                <h3 className="text-base font-serif font-bold text-slate-900 flex items-center gap-2">
                  <Truck className="w-5 h-5 text-pink-500" />
                  <span>Configuración de Montos de Envío por Provincia</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Ajusta los costos y tiempos estimados de entrega para cada provincia o zona de Panamá. Los clientes verán estos montos al seleccionar su provincia en el checkout Yappy.
                </p>
              </div>

              {/* Add New Province Form */}
              <form onSubmit={handleAddProvinceSubmit} className="bg-rose-50/60 p-4 rounded-2xl border border-rose-100 space-y-3">
                <p className="text-xs font-bold text-slate-800">Agregar Nueva Provincia o Región de Entrega</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="block mb-1 font-semibold text-slate-700">Provincia / Región *</label>
                    <input
                      type="text"
                      required
                      value={newProvName}
                      onChange={(e) => setNewProvName(e.target.value)}
                      placeholder="Ej: Isla Colón, Bocas"
                      className="w-full px-3 py-2 rounded-xl border border-rose-200 bg-white font-medium"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-semibold text-slate-700">Monto Envío ($) *</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={newProvFee}
                      onChange={(e) => setNewProvFee(e.target.value)}
                      placeholder="5.00"
                      className="w-full px-3 py-2 rounded-xl border border-rose-200 bg-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-semibold text-slate-700">Tiempo Estimado</label>
                    <input
                      type="text"
                      value={newProvTime}
                      onChange={(e) => setNewProvTime(e.target.value)}
                      placeholder="24-48 horas"
                      className="w-full px-3 py-2 rounded-xl border border-rose-200 bg-white font-medium"
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-pink-500 hover:bg-rose-600 text-white text-xs font-bold shadow-md flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Guardar Nueva Provincia</span>
                  </button>
                </div>
              </form>

              {/* List / Table of Provinces */}
              <div className="space-y-3">
                <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">Provincias & Tarifas Vigentes</p>
                <div className="space-y-2">
                  {(settings.provinceFees || []).map((prov) => (
                    <div key={prov.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="flex-1">
                        <p className="text-xs font-extrabold text-slate-900">{prov.provinceName}</p>
                        <p className="text-[10px] text-slate-500">Tiempo estimado: {prov.estimatedTime || 'N/A'}</p>
                      </div>

                      <div className="flex items-center gap-3 w-full sm:w-auto">
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-bold text-slate-500">$</span>
                          <input
                            type="number"
                            step="0.01"
                            value={prov.fee}
                            onChange={(e) => updateProvinceFee(prov.id, parseFloat(e.target.value) || 0, prov.estimatedTime)}
                            className="w-20 px-2 py-1 rounded-lg border border-slate-300 bg-white text-xs font-extrabold text-rose-900 text-right"
                          />
                        </div>

                        <input
                          type="text"
                          value={prov.estimatedTime || ''}
                          onChange={(e) => updateProvinceFee(prov.id, prov.fee, e.target.value)}
                          placeholder="Tiempo entrega"
                          className="w-32 px-2 py-1 rounded-lg border border-slate-300 bg-white text-xs font-medium text-slate-700"
                        />

                        <button
                          onClick={() => {
                            if (confirm(`¿Eliminar la tarifa para ${prov.provinceName}?`)) {
                              deleteProvinceFee(prov.id);
                            }
                          }}
                          className="p-1.5 rounded-lg hover:bg-rose-100 text-slate-500 hover:text-rose-600 transition-colors"
                          title="Eliminar tarifa"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: PORTADA / BANNER EDITOR */}
          {activeTab === 'banner' && (
            <div className="max-w-4xl mx-auto bg-white rounded-2xl p-6 border border-rose-100 shadow-2xs space-y-6">
              <div>
                <h3 className="text-base font-serif font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-pink-500" />
                  <span>Editor del Container de Portada (Hero Banner)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Personaliza los textos, insignias e imágenes del banner principal que verán los clientes al entrar a tu tienda.
                </p>
              </div>

              {settingsSavedMsg && (
                <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2 border border-emerald-200">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>{settingsSavedMsg}</span>
                </div>
              )}

              <form onSubmit={handleSaveSettings} className="space-y-5 text-xs font-bold text-slate-700">
                {/* Badge Text */}
                <div>
                  <label className="block mb-1 font-semibold text-slate-800">
                    Etiqueta Superior (Insignia Flotante)
                  </label>
                  <input
                    type="text"
                    value={heroBadgeText}
                    onChange={(e) => setHeroBadgeText(e.target.value)}
                    placeholder="Ej: Colección Exclusiva de Belleza & Fragancias"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-rose-200 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-pink-400"
                  />
                </div>

                {/* Main Hero Title */}
                <div>
                  <label className="block mb-1 font-semibold text-slate-800">
                    Título Principal de la Portada
                  </label>
                  <input
                    type="text"
                    required
                    value={heroTitle}
                    onChange={(e) => setHeroTitle(e.target.value)}
                    placeholder="Ej: Descubre la fragancia que enamora tu estilo"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-rose-200 bg-white font-bold text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 text-slate-900"
                  />
                </div>

                {/* Subtitle / Description */}
                <div>
                  <label className="block mb-1 font-semibold text-slate-800">
                    Descripción / Subtítulo Promocional
                  </label>
                  <textarea
                    rows={3}
                    value={heroSubtitle}
                    onChange={(e) => setHeroSubtitle(e.target.value)}
                    placeholder="Ej: Perfumes finos, mists ligeros, cremas hidratantes..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-rose-200 bg-white font-normal text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-pink-400"
                  />
                </div>

                {/* Hero Image Section */}
                <div className="p-4 bg-rose-50/70 rounded-2xl border border-rose-100 space-y-3">
                  <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Image className="w-4 h-4 text-pink-500" />
                    <span>Imagen Destacada de la Portada</span>
                  </p>

                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="shrink-0 flex items-center justify-center">
                      {heroImageUrl ? (
                        <img
                          src={heroImageUrl}
                          alt="Portada Preview"
                          className="w-24 h-32 rounded-2xl object-cover border-2 border-pink-300 shadow-md -rotate-1"
                        />
                      ) : (
                        <div className="w-24 h-32 rounded-2xl bg-gradient-to-tr from-pink-400 to-rose-200 shadow-sm flex items-center justify-center">
                          <Sparkles className="w-8 h-8 text-white" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 space-y-2 w-full">
                      <label className="block text-[11px] font-bold text-slate-600">
                        URL de la Imagen o Subir archivo
                      </label>
                      <input
                        type="text"
                        value={heroImageUrl}
                        onChange={(e) => setHeroImageUrl(e.target.value)}
                        placeholder="https://images.unsplash.com/..."
                        className="w-full px-3.5 py-2 rounded-xl border border-rose-200 bg-white font-medium text-xs"
                      />

                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <label className="cursor-pointer px-3 py-1.5 rounded-xl bg-pink-500 hover:bg-rose-600 text-white font-bold text-[11px] flex items-center gap-1.5 shadow-xs transition-colors">
                          <Upload className="w-3.5 h-3.5" />
                          <span>Subir Imagen de Portada</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleHeroFileUpload}
                            className="hidden"
                          />
                        </label>

                        {heroImageUrl && (
                          <button
                            type="button"
                            onClick={() => setHeroImageUrl('https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=600')}
                            className="px-3 py-1.5 rounded-xl bg-white border border-rose-200 text-rose-800 hover:bg-rose-100 font-bold text-[11px]"
                          >
                            Restablecer Imagen
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-pink-500 hover:bg-rose-600 text-white text-xs font-bold shadow-md flex items-center gap-2 transition-colors"
                  >
                    <Check className="w-4 h-4" />
                    <span>Guardar Cambios de la Portada</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: YAPPY TRANSACTIONS & ORDERS */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-rose-100 shadow-2xs">
                <div>
                  <h3 className="text-base font-serif font-bold text-slate-900">Registro de Transacciones & Pedidos Yappy</h3>
                  <p className="text-xs text-slate-500">Revisa pagos recibidos por Yappy, comprobantes adjuntos y actualiza su estado.</p>
                </div>

                {/* Filter Dropdown */}
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-slate-400" />
                  <select
                    value={orderFilterStatus}
                    onChange={(e) => setOrderFilterStatus(e.target.value as OrderStatus | 'todos')}
                    className="px-3 py-1.5 rounded-xl border border-rose-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-pink-400"
                  >
                    <option value="todos">Todos los Estados</option>
                    <option value="pendiente_yappy">Pendiente Yappy</option>
                    <option value="confirmado">Confirmado</option>
                    <option value="enviado">Enviado</option>
                    <option value="completado">Completado</option>
                    <option value="cancelado">Cancelado</option>
                  </select>
                </div>
              </div>

              {/* Orders List */}
              <div className="space-y-3">
                {filteredOrders.length === 0 ? (
                  <div className="bg-white rounded-2xl p-8 text-center text-slate-500 border border-rose-100">
                    <p className="font-bold">No hay transacciones registradas en este estado.</p>
                  </div>
                ) : (
                  filteredOrders.map((order) => (
                    <div
                      key={order.id}
                      className="bg-white rounded-2xl p-5 border border-rose-100 shadow-2xs hover:shadow-md transition-shadow flex flex-col md:flex-row justify-between gap-4 items-start md:items-center"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-sm text-slate-900">#{order.id}</span>
                          <span className="text-xs text-slate-400">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </span>
                          <span className="bg-sky-100 text-sky-900 font-extrabold text-[10px] px-2.5 py-0.5 rounded-full">
                            Ref Yappy: {order.yappyRefNumber}
                          </span>
                        </div>

                        <p className="text-sm font-bold text-slate-800">{order.customerName}</p>
                        <p className="text-xs text-slate-500">
                          📞 {order.customerPhone} • 📍 {order.deliveryAddress}
                        </p>

                        <p className="text-xs font-semibold text-rose-900 pt-1">
                          {order.items.map((i) => `${i.quantity}x ${i.productName}`).join(', ')}
                        </p>
                      </div>

                      <div className="flex flex-col md:items-end gap-2 shrink-0">
                        <div className="text-right">
                          <p className="text-xs text-slate-400">Total Transacción</p>
                          <p className="text-lg font-extrabold text-rose-900">${order.total.toFixed(2)}</p>
                        </div>

                        <div className="flex items-center gap-2">
                          <select
                            value={order.status}
                            onChange={(e) => updateOrderStatus(order.id, e.target.value as OrderStatus)}
                            className="px-3 py-1 rounded-xl border border-rose-200 text-xs font-bold bg-rose-50 text-rose-900 focus:outline-none"
                          >
                            <option value="pendiente_yappy">Pendiente Yappy</option>
                            <option value="confirmado">Confirmado</option>
                            <option value="enviado">Enviado</option>
                            <option value="completado">Completado</option>
                            <option value="cancelado">Cancelado</option>
                          </select>

                          <button
                            onClick={() => setViewingOrder(order)}
                            className="p-1.5 rounded-xl bg-slate-100 hover:bg-pink-100 text-slate-700 hover:text-pink-600 transition-colors text-xs font-bold flex items-center gap-1"
                            title="Ver detalles y comprobante"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => {
                              if (confirm('¿Eliminar esta transacción?')) deleteOrder(order.id);
                            }}
                            className="p-1.5 rounded-xl bg-slate-100 hover:bg-rose-100 text-slate-700 hover:text-rose-600 transition-colors"
                            title="Eliminar registro"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 3: STORE SETTINGS */}
          {activeTab === 'settings' && (
            <div className="max-w-2xl mx-auto space-y-6">
              {/* Admin Login Credentials Box */}
              <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-lg space-y-4">
                <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                  <div className="p-2.5 bg-pink-500/20 text-pink-400 rounded-xl border border-pink-500/30">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-serif font-bold text-white flex items-center gap-2">
                      <span>Credenciales de Acceso Administrador (Login)</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Sincronizado en la nube con Supabase (<code className="text-pink-300 font-mono">public.users</code>).
                    </p>
                  </div>
                </div>

                {adminCredSavedMsg && (
                  <div className="p-3 bg-emerald-950/80 text-emerald-300 rounded-xl text-xs font-bold flex items-center gap-2 border border-emerald-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>{adminCredSavedMsg}</span>
                  </div>
                )}

                <form onSubmit={handleSaveAdminCredentials} className="space-y-4 text-xs font-bold">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-1 text-slate-300">Usuario Administrador</label>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          value={adminUsername}
                          onChange={(e) => setAdminUsername(e.target.value)}
                          placeholder="Angela28"
                          className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white font-mono focus:outline-none focus:ring-2 focus:ring-pink-500 text-xs"
                        />
                        <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                      </div>
                    </div>

                    <div>
                      <label className="block mb-1 text-slate-300">Contraseña de Acceso</label>
                      <div className="relative">
                        <input
                          type={showAdminPass ? 'text' : 'password'}
                          required
                          value={adminPassword}
                          onChange={(e) => setAdminPassword(e.target.value)}
                          placeholder="1234578"
                          className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white font-mono focus:outline-none focus:ring-2 focus:ring-pink-500 text-xs"
                        />
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                        <button
                          type="button"
                          onClick={() => setShowAdminPass(!showAdminPass)}
                          className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200"
                        >
                          {showAdminPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-pink-500 hover:bg-rose-600 text-white text-xs font-bold shadow-md flex items-center gap-2 transition-colors"
                    >
                      <Check className="w-4 h-4" />
                      <span>Guardar Usuario y Contraseña</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* General Store Settings Box */}
              <div className="bg-white rounded-2xl p-6 border border-rose-100 shadow-2xs space-y-5">
                <div>
                  <h3 className="text-base font-serif font-bold text-slate-900">Ajustes de la Tienda & Yappy</h3>
                  <p className="text-xs text-slate-500">Configura tu nombre de marca, número Yappy y parámetros de envío.</p>
                </div>


              {settingsSavedMsg && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold p-3 rounded-xl flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{settingsSavedMsg}</span>
                </div>
              )}

              <form onSubmit={handleSaveSettings} className="space-y-4 text-xs font-bold text-slate-700">
                {/* Logo Editor Section */}
                <div className="p-4 bg-rose-50/70 rounded-2xl border border-rose-100 space-y-3">
                  <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Image className="w-4 h-4 text-pink-500" />
                    <span>Logo de la Tienda / Marca</span>
                  </p>
                  
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="shrink-0 flex items-center justify-center">
                      {storeLogoUrl ? (
                        <img
                          src={storeLogoUrl}
                          alt="Logo Preview"
                          className="w-16 h-16 rounded-2xl object-cover border-2 border-pink-300 shadow-sm"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-300 p-0.5 shadow-sm flex items-center justify-center">
                          <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
                            <Sparkles className="w-8 h-8 text-pink-500" />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 space-y-2 w-full">
                      <input
                        type="text"
                        value={storeLogoUrl}
                        onChange={(e) => setStoreLogoUrl(e.target.value)}
                        placeholder="URL de la imagen del Logo (HTTPS, base64...)"
                        className="w-full px-3.5 py-2 rounded-xl border border-rose-200 bg-white font-medium text-xs"
                      />

                      <div className="flex flex-wrap items-center gap-2">
                        <label className="cursor-pointer px-3 py-1.5 rounded-xl bg-pink-500 hover:bg-rose-600 text-white font-bold text-[11px] flex items-center gap-1.5 shadow-xs transition-colors">
                          <Upload className="w-3.5 h-3.5" />
                          <span>Subir Logo desde mi dispositivo</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleLogoFileUpload}
                            className="hidden"
                          />
                        </label>

                        {storeLogoUrl && (
                          <button
                            type="button"
                            onClick={() => setStoreLogoUrl('')}
                            className="px-3 py-1.5 rounded-xl bg-white border border-rose-200 text-rose-800 hover:bg-rose-100 font-bold text-[11px]"
                          >
                            Restablecer Logo
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1">Nombre de la Tienda</label>
                    <input
                      type="text"
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-rose-200 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block mb-1">Subtítulo / Tagline</label>
                    <input
                      type="text"
                      value={storeTagline}
                      onChange={(e) => setStoreTagline(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-rose-200 font-medium"
                    />
                  </div>
                </div>

                <div className="p-4 bg-sky-50 rounded-2xl border border-sky-200 space-y-3">
                  <p className="text-xs font-bold text-sky-950 flex items-center gap-1.5">
                    💳 Configuración de Cuenta Yappy
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-normal">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Número de Teléfono Yappy</label>
                      <input
                        type="text"
                        value={yappyPhone}
                        onChange={(e) => setYappyPhone(e.target.value)}
                        placeholder="+507 6900-1234"
                        className="w-full px-3.5 py-2 rounded-xl border border-sky-200 bg-white font-mono text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Titular de Cuenta Yappy</label>
                      <input
                        type="text"
                        value={yappyName}
                        onChange={(e) => setYappyName(e.target.value)}
                        placeholder="Aura Luxe Panamá"
                        className="w-full px-3.5 py-2 rounded-xl border border-sky-200 bg-white text-xs"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1">Teléfono WhatsApp de Soporte</label>
                    <input
                      type="text"
                      value={whatsappPhone}
                      onChange={(e) => setWhatsappPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-rose-200 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block mb-1">Costo Envío Estándar ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={deliveryFee}
                      onChange={(e) => setDeliveryFee(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-rose-200 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block mb-1">Monto Mínimo para Envío Gratis ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={freeDeliveryMin}
                    onChange={(e) => setFreeDeliveryMin(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-rose-200 font-medium"
                  />
                </div>

                <div>
                  <label className="block mb-1">Texto de la Barra de Anuncios Superior</label>
                  <input
                    type="text"
                    value={announcementText}
                    onChange={(e) => setAnnouncementText(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-rose-200 font-medium"
                  />
                </div>

                <div className="pt-3 border-t border-rose-100 flex justify-end">
                  <button
                    type="submit"
                    className="py-2.5 px-6 rounded-xl bg-pink-500 hover:bg-rose-600 text-white font-bold text-xs shadow-md transition-all"
                  >
                    Guardar Cambios
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

          {/* TAB 4: SUPABASE INTEGRATION */}
          {activeTab === 'supabase' && (
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="bg-white rounded-2xl p-6 border border-rose-100 shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-serif font-bold text-slate-900 flex items-center gap-2">
                      <Database className="w-5 h-5 text-emerald-600" />
                      Conexión a Base de Datos Supabase
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Ingresa tus credenciales de Supabase para almacenar en la nube en tiempo real tus productos y transacciones.
                    </p>
                  </div>

                  <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                    supabaseConfig.isConnected
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {supabaseConfig.isConnected ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" /> Conectado a Supabase
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-3.5 h-3.5" /> Modo Local (Fallback)
                      </>
                    )}
                  </div>
                </div>

                <form onSubmit={handleSaveSupabaseConfig} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Project URL de Supabase</label>
                    <input
                      type="url"
                      required
                      value={spUrl}
                      onChange={(e) => setSpUrl(e.target.value)}
                      placeholder="https://xyz.supabase.co"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-rose-200 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Anon / Public API Key</label>
                    <input
                      type="password"
                      required
                      value={spKey}
                      onChange={(e) => setSpKey(e.target.value)}
                      placeholder="eyJhbGciOi..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-rose-200 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  {spMessage && (
                    <div className={`p-3 rounded-xl font-bold ${
                      spMessage.success ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'
                    }`}>
                      {spMessage.text}
                    </div>
                  )}

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={spTesting}
                      className="py-2.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all"
                    >
                      {spTesting ? 'Probando Conexión...' : 'Probar & Guardar Conexión'}
                    </button>
                  </div>
                </form>
              </div>

              {/* SQL Schema Generator Box */}
              <div className="bg-slate-900 text-slate-200 rounded-2xl p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white">Script SQL para crear las tablas en Supabase</h4>
                    <p className="text-xs text-slate-400">Copia este código y pégalo en el Editor SQL de supabase.com</p>
                  </div>
                  <button
                    onClick={handleCopySql}
                    className="py-1.5 px-3 rounded-lg bg-pink-500 hover:bg-rose-600 text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
                  >
                    {copiedSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedSql ? '¡Copiado!' : 'Copiar Script SQL'}</span>
                  </button>
                </div>

                <pre className="bg-slate-950 p-4 rounded-xl text-[11px] font-mono text-emerald-400 overflow-x-auto max-h-48 border border-slate-800">
                  {SUPABASE_SQL_SCHEMA}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* PRODUCT FORM MODAL (Add/Edit) */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative bg-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl border border-rose-100 max-h-[90vh] flex flex-col">
            <div className="p-5 bg-pink-500 text-white flex items-center justify-between">
              <h3 className="font-serif font-bold text-lg">
                {editingProduct ? 'Editar Producto' : 'Agregar Nuevo Producto'}
              </h3>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="p-1 rounded-full hover:bg-pink-600 text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nombre del Producto *</label>
                <input
                  type="text"
                  required
                  value={prodName}
                  onChange={(e) => setProdName(e.target.value)}
                  placeholder="Ej: Velvet Vanilla Body Mist"
                  className="w-full px-3.5 py-2 rounded-xl border border-rose-200 text-sm font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Categoría *</label>
                  <select
                    value={prodCategory}
                    onChange={(e) => setProdCategory(e.target.value as ProductCategory)}
                    className="w-full px-3.5 py-2 rounded-xl border border-rose-200 font-bold"
                  >
                    {(settings.categories || []).map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Contenido / Tamaño</label>
                  <input
                    type="text"
                    value={prodVolume}
                    onChange={(e) => setProdVolume(e.target.value)}
                    placeholder="Ej: 250 ml, 100 g"
                    className="w-full px-3.5 py-2 rounded-xl border border-rose-200 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Precio Actual ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={prodPrice}
                    onChange={(e) => setProdPrice(e.target.value)}
                    placeholder="25.00"
                    className="w-full px-3.5 py-2 rounded-xl border border-rose-200 font-extrabold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Precio Original / Tachado ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={prodOriginalPrice}
                    onChange={(e) => setProdOriginalPrice(e.target.value)}
                    placeholder="30.00 (Opcional)"
                    className="w-full px-3.5 py-2 rounded-xl border border-rose-200 text-slate-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Descripción del Producto *</label>
                <textarea
                  required
                  rows={3}
                  value={prodDescription}
                  onChange={(e) => setProdDescription(e.target.value)}
                  placeholder="Fragancia con notas de vainilla dulce y orquídea de noche..."
                  className="w-full px-3.5 py-2 rounded-xl border border-rose-200 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Notas de Aroma (Separadas por comas)
                </label>
                <input
                  type="text"
                  value={prodScentNotes}
                  onChange={(e) => setProdScentNotes(e.target.value)}
                  placeholder="Vainilla, Rosa, Coco, Ámbar"
                  className="w-full px-3.5 py-2 rounded-xl border border-rose-200 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Imagen del Producto *</label>
                <div className="space-y-2">
                  <input
                    type="url"
                    required
                    value={prodImage}
                    onChange={(e) => setProdImage(e.target.value)}
                    placeholder="URL de la imagen (Unsplash, HTTPS, etc.)"
                    className="w-full px-3.5 py-2 rounded-xl border border-rose-200 font-medium text-xs"
                  />

                  {/* Local Photo Upload Button */}
                  <div className="flex items-center gap-2">
                    <label className="cursor-pointer px-3 py-1.5 rounded-lg bg-rose-100 hover:bg-pink-200 text-rose-900 font-bold text-xs flex items-center gap-1">
                      <Upload className="w-3.5 h-3.5" /> Subir foto desde mi dispositivo
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {prodImage && (
                    <img
                      src={prodImage}
                      alt="Vista previa"
                      className="w-20 h-20 object-cover rounded-xl border border-pink-200"
                    />
                  )}
                </div>
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer font-bold">
                  <input
                    type="checkbox"
                    checked={prodInStock}
                    onChange={(e) => setProdInStock(e.target.checked)}
                    className="accent-pink-500 w-4 h-4"
                  />
                  <span>En Stock</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-bold">
                  <input
                    type="checkbox"
                    checked={prodIsBestSeller}
                    onChange={(e) => setProdIsBestSeller(e.target.checked)}
                    className="accent-pink-500 w-4 h-4"
                  />
                  <span>Destacar como Más Vendido</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-bold">
                  <input
                    type="checkbox"
                    checked={prodIsNew}
                    onChange={(e) => setProdIsNew(e.target.checked)}
                    className="accent-pink-500 w-4 h-4"
                  />
                  <span>Marcar como Nuevo</span>
                </label>
              </div>

              <div className="pt-4 border-t border-rose-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-pink-500 hover:bg-rose-600 text-white font-bold shadow-md"
                >
                  Guardar Producto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW ORDER DETAIL MODAL */}
      {viewingOrder && (
        <div className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-rose-100 p-6 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-rose-100 text-rose-900 px-2.5 py-0.5 rounded-full">
                  Pedido #{viewingOrder.id}
                </span>
                <h3 className="text-lg font-serif font-bold text-slate-900 mt-1">
                  Cliente: {viewingOrder.customerName}
                </h3>
              </div>
              <button onClick={() => setViewingOrder(null)} className="p-1 rounded-full hover:bg-slate-100">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="space-y-2 text-xs bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
              <p><strong>Teléfono:</strong> {viewingOrder.customerPhone}</p>
              <p><strong>Dirección:</strong> {viewingOrder.deliveryAddress} ({viewingOrder.deliveryMethod})</p>
              <p><strong>Ref Yappy:</strong> <span className="font-mono font-bold text-sky-700">{viewingOrder.yappyRefNumber}</span></p>
              <p><strong>Fecha:</strong> {new Date(viewingOrder.createdAt).toLocaleString()}</p>
            </div>

            {/* Payment Proof Photo if uploaded */}
            {viewingOrder.paymentProofUrl && (
              <div>
                <p className="text-xs font-bold text-slate-700 mb-1">Comprobante de Pago Yappy Adjunto:</p>
                <img
                  src={viewingOrder.paymentProofUrl}
                  alt="Comprobante Yappy"
                  className="max-h-56 w-full object-contain rounded-xl border border-slate-200 bg-black/5"
                />
              </div>
            )}

            <div className="space-y-2 border-t border-rose-100 pt-3">
              <p className="text-xs font-bold text-slate-800">Productos del Pedido:</p>
              <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                {viewingOrder.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-xs py-1 border-b border-slate-100">
                    <span>{item.quantity}x {item.productName} ({item.volume || 'estándar'})</span>
                    <span className="font-bold">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-sm font-extrabold text-rose-900 pt-1">
                <span>Total Final:</span>
                <span>${viewingOrder.total.toFixed(2)}</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setViewingOrder(null)}
                className="py-2 px-5 rounded-xl bg-slate-900 text-white font-bold text-xs"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
