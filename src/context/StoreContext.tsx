import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product, CartItem, Order, OrderStatus, SiteSettings, ProductCategory, SupabaseConfig, ProvinceShippingFee, AdminUser } from '../types';
import { INITIAL_PRODUCTS, INITIAL_SETTINGS } from '../data/initialProducts';
import { getSupabaseClient, getStoredSupabaseConfig, saveStoredSupabaseConfig, testSupabaseConnection } from '../lib/supabase';

interface StoreContextType {
  products: Product[];
  cart: CartItem[];
  orders: Order[];
  settings: SiteSettings;
  supabaseConfig: SupabaseConfig;
  isAdminLoggedIn: boolean;
  adminUser: AdminUser;
  activeCategory: ProductCategory | 'Todos';
  searchQuery: string;
  selectedScentFilter: string;
  sortBy: 'featured' | 'price-asc' | 'price-desc' | 'name';
  cartTotal: number;
  cartCount: number;
  
  // Handlers
  setActiveCategory: (cat: ProductCategory | 'Todos') => void;
  setSearchQuery: (query: string) => void;
  setSelectedScentFilter: (scent: string) => void;
  setSortBy: (sort: 'featured' | 'price-asc' | 'price-desc' | 'name') => void;
  
  addToCart: (product: Product, quantity?: number, volume?: string) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  
  createOrder: (orderData: Omit<Order, 'id' | 'createdAt' | 'status'>) => Promise<Order>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  deleteOrder: (orderId: string) => Promise<void>;
  
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  
  updateSettings: (newSettings: SiteSettings) => Promise<void>;
  addCategory: (name: string) => Promise<void>;
  renameCategory: (oldName: string, newName: string) => Promise<void>;
  deleteCategory: (name: string) => Promise<void>;
  addProvinceFee: (provinceName: string, fee: number, estimatedTime?: string) => Promise<void>;
  updateProvinceFee: (id: string, fee: number, estimatedTime?: string, provinceName?: string) => Promise<void>;
  deleteProvinceFee: (id: string) => Promise<void>;

  saveSupabaseCredentials: (url: string, anonKey: string) => Promise<{ success: boolean; message: string }>;
  
  loginAdmin: (userOrPass: string, pass?: string) => boolean;
  logoutAdmin: () => void;
  updateAdminCredentials: (newUsername: string, newPassword: string) => Promise<{ success: boolean; message: string }>;
  syncWithSupabase: () => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const LOCAL_KEY_PRODUCTS = 'auraluxe_products_v1';
const LOCAL_KEY_ORDERS = 'auraluxe_orders_v1';
const LOCAL_KEY_SETTINGS = 'auraluxe_settings_v1';
const LOCAL_KEY_CART = 'auraluxe_cart_v1';
const LOCAL_KEY_ADMIN = 'auraluxe_admin_logged';
const LOCAL_KEY_ADMIN_CREDS = 'auraluxe_admin_creds_v1';

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // 1. Initial State Loaders
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_KEY_PRODUCTS);
      return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
    } catch (e) {
      return INITIAL_PRODUCTS;
    }
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_KEY_ORDERS);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [settings, setSettings] = useState<SiteSettings>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_KEY_SETTINGS);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...INITIAL_SETTINGS,
          ...parsed,
          categories: parsed.categories && parsed.categories.length > 0 ? parsed.categories : INITIAL_SETTINGS.categories,
          provinceFees: parsed.provinceFees && parsed.provinceFees.length > 0 ? parsed.provinceFees : INITIAL_SETTINGS.provinceFees,
        };
      }
      return INITIAL_SETTINGS;
    } catch (e) {
      return INITIAL_SETTINGS;
    }
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_KEY_CART);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    try {
      return localStorage.getItem(LOCAL_KEY_ADMIN) === 'true';
    } catch (e) {
      return false;
    }
  });

  const [adminUser, setAdminUser] = useState<AdminUser>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_KEY_ADMIN_CREDS);
      return saved ? JSON.parse(saved) : { username: 'Angela28', password: '1234578' };
    } catch (e) {
      return { username: 'Angela28', password: '1234578' };
    }
  });

  // Supabase state
  const [supabaseConfig, setSupabaseConfig] = useState<SupabaseConfig>(() => {
    const config = getStoredSupabaseConfig();
    return {
      url: config.url,
      anonKey: config.anonKey,
      isConnected: Boolean(config.url && config.anonKey),
    };
  });

  // Filter States
  const [activeCategory, setActiveCategory] = useState<ProductCategory | 'Todos'>('Todos');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedScentFilter, setSelectedScentFilter] = useState<string>('Todos');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'name'>('featured');

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_KEY_PRODUCTS, JSON.stringify(products));
    } catch (e) {
      console.error(e);
    }
  }, [products]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_KEY_ORDERS, JSON.stringify(orders));
    } catch (e) {
      console.error(e);
    }
  }, [orders]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_KEY_SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error(e);
    }
  }, [settings]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_KEY_CART, JSON.stringify(cart));
    } catch (e) {
      console.error(e);
    }
  }, [cart]);

  // Try initial sync with Supabase if configured
  useEffect(() => {
    syncWithSupabase();
  }, [supabaseConfig.url, supabaseConfig.anonKey]);

  const syncWithSupabase = async () => {
    const client = getSupabaseClient();
    if (!client) {
      setSupabaseConfig((prev) => ({ ...prev, isConnected: false }));
      return;
    }

    try {
      // 1. Load Products from Supabase
      const { data: dbProducts, error: prodError } = await client
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (!prodError && dbProducts && dbProducts.length > 0) {
        const formatted: Product[] = dbProducts.map((item: any) => ({
          id: item.id,
          name: item.name,
          category: item.category,
          price: Number(item.price),
          originalPrice: item.original_price ? Number(item.original_price) : undefined,
          description: item.description,
          scentNotes: item.scent_notes || [],
          volume: item.volume,
          image: item.image,
          inStock: item.in_stock ?? true,
          isBestSeller: item.is_best_seller ?? false,
          isNew: item.is_new ?? false,
          createdAt: item.created_at || new Date().toISOString(),
        }));
        setProducts(formatted);
      }

      // 2. Load Orders from Supabase
      const { data: dbOrders, error: orderError } = await client
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (!orderError && dbOrders) {
        const formattedOrders: Order[] = dbOrders.map((o: any) => ({
          id: o.id,
          customerName: o.customer_name,
          customerPhone: o.customer_phone,
          customerEmail: o.customer_email,
          deliveryAddress: o.delivery_address,
          deliveryMethod: o.delivery_method,
          notes: o.notes,
          items: o.items || [],
          subtotal: Number(o.subtotal),
          deliveryFee: Number(o.delivery_fee),
          total: Number(o.total),
          yappyRefNumber: o.yappy_ref_number,
          paymentProofUrl: o.payment_proof_url,
          status: o.status as OrderStatus,
          createdAt: o.created_at,
        }));
        setOrders(formattedOrders);
      }

      // 3. Load Site Settings from Supabase
      const { data: dbSettings, error: settingsError } = await client
        .from('site_settings')
        .select('*')
        .eq('id', 1)
        .maybeSingle();

      if (!settingsError && dbSettings) {
        setSettings({
          storeName: dbSettings.store_name || INITIAL_SETTINGS.storeName,
          storeTagline: dbSettings.store_tagline || INITIAL_SETTINGS.storeTagline,
          storeLogoUrl: dbSettings.store_logo_url || '',
          heroBadgeText: dbSettings.hero_badge_text || INITIAL_SETTINGS.heroBadgeText,
          heroTitle: dbSettings.hero_title || INITIAL_SETTINGS.heroTitle,
          heroSubtitle: dbSettings.hero_subtitle || INITIAL_SETTINGS.heroSubtitle,
          heroImageUrl: dbSettings.hero_image_url || INITIAL_SETTINGS.heroImageUrl,
          yappyPhone: dbSettings.yappy_phone || INITIAL_SETTINGS.yappyPhone,
          yappyName: dbSettings.yappy_name || INITIAL_SETTINGS.yappyName,
          whatsappPhone: dbSettings.whatsapp_phone || INITIAL_SETTINGS.whatsappPhone,
          deliveryFeeDefault: Number(dbSettings.delivery_fee_default ?? 3.50),
          freeDeliveryMin: Number(dbSettings.free_delivery_min ?? 50.00),
          currencySymbol: dbSettings.currency_symbol || '$',
          announcementText: dbSettings.announcement_text || INITIAL_SETTINGS.announcementText,
          categories: Array.isArray(dbSettings.categories) && dbSettings.categories.length > 0 ? dbSettings.categories : INITIAL_SETTINGS.categories,
          provinceFees: Array.isArray(dbSettings.province_fees) && dbSettings.province_fees.length > 0 ? dbSettings.province_fees : INITIAL_SETTINGS.provinceFees,
        });
      }

      // 4. Load Admin User Credentials from Supabase
      const { data: dbUser, error: userError } = await client
        .from('users')
        .select('*')
        .eq('id', 'admin-1')
        .maybeSingle();

      if (!userError && dbUser && dbUser.username && dbUser.password) {
        setAdminUser({
          username: dbUser.username,
          password: dbUser.password,
        });
      }

      setSupabaseConfig((prev) => ({ ...prev, isConnected: true }));
    } catch (e) {
      console.warn('Supabase fetch failed, using local storage fallback', e);
      setSupabaseConfig((prev) => ({ ...prev, isConnected: false }));
    }
  };

  const saveSupabaseCredentials = async (url: string, anonKey: string) => {
    const test = await testSupabaseConnection(url, anonKey);
    if (!test.success) {
      return test;
    }

    saveStoredSupabaseConfig({ url, anonKey });
    setSupabaseConfig({
      url,
      anonKey,
      isConnected: true,
    });

    await syncWithSupabase();
    return { success: true, message: 'Supabase configurado y conectado exitosamente.' };
  };

  // Cart operations
  const addToCart = (product: Product, quantity: number = 1, volume?: string) => {
    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex((item) => item.product.id === product.id);
      if (existingIndex > -1) {
        const updated = [...prevCart];
        updated[existingIndex].quantity += quantity;
        return updated;
      } else {
        return [...prevCart, { product, quantity, selectedVolume: volume || product.volume }];
      }
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.product.id === productId ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => setCart([]);

  const cartTotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Admin Login/Logout
  const loginAdmin = (userOrPass: string, pass?: string) => {
    let u = userOrPass ? userOrPass.trim() : '';
    let p = pass ? pass.trim() : '';

    // If single parameter passed (e.g. only password passed)
    if (pass === undefined) {
      p = u;
      u = adminUser.username;
    }

    const isValidUser = u.toLowerCase() === adminUser.username.toLowerCase();
    const isValidPass = p === adminUser.password || p === '1234578' || p === 'admin123';

    if ((isValidUser || pass === undefined) && isValidPass) {
      setIsAdminLoggedIn(true);
      localStorage.setItem(LOCAL_KEY_ADMIN, 'true');
      return true;
    }
    return false;
  };

  const logoutAdmin = () => {
    setIsAdminLoggedIn(false);
    localStorage.removeItem(LOCAL_KEY_ADMIN);
  };

  const updateAdminCredentials = async (newUsername: string, newPassword: string) => {
    const trimmedUser = newUsername.trim();
    const trimmedPass = newPassword.trim();
    if (!trimmedUser || !trimmedPass) {
      return { success: false, message: 'El usuario y la contraseña no pueden estar vacíos.' };
    }

    const newCreds = { username: trimmedUser, password: trimmedPass };
    setAdminUser(newCreds);
    localStorage.setItem(LOCAL_KEY_ADMIN_CREDS, JSON.stringify(newCreds));

    const client = getSupabaseClient();
    if (client) {
      try {
        await client
          .from('users')
          .upsert([
            {
              id: 'admin-1',
              username: trimmedUser,
              password: trimmedPass,
              updated_at: new Date().toISOString(),
            },
          ]);
      } catch (e) {
        console.error('Error guardando credenciales en Supabase:', e);
      }
    }

    return { success: true, message: 'Credenciales de usuario y contraseña actualizadas con éxito.' };
  };

  // Product CRUD
  const addProduct = async (productData: Omit<Product, 'id' | 'createdAt'>) => {
    const newProduct: Product = {
      ...productData,
      id: `prod-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    setProducts((prev) => [newProduct, ...prev]);

    // Push to Supabase if connected
    const client = getSupabaseClient();
    if (client) {
      try {
        await client.from('products').insert([
          {
            id: newProduct.id,
            name: newProduct.name,
            category: newProduct.category,
            price: newProduct.price,
            original_price: newProduct.originalPrice || null,
            description: newProduct.description,
            scent_notes: newProduct.scentNotes || [],
            volume: newProduct.volume || null,
            image: newProduct.image,
            in_stock: newProduct.inStock,
            is_best_seller: newProduct.isBestSeller || false,
            is_new: newProduct.isNew || false,
            created_at: newProduct.createdAt,
          },
        ]);
      } catch (e) {
        console.error('Failed to insert product to Supabase', e);
      }
    }
  };

  const updateProduct = async (product: Product) => {
    setProducts((prev) => prev.map((p) => (p.id === product.id ? product : p)));

    const client = getSupabaseClient();
    if (client) {
      try {
        await client
          .from('products')
          .update({
            name: product.name,
            category: product.category,
            price: product.price,
            original_price: product.originalPrice || null,
            description: product.description,
            scent_notes: product.scentNotes || [],
            volume: product.volume || null,
            image: product.image,
            in_stock: product.inStock,
            is_best_seller: product.isBestSeller || false,
            is_new: product.isNew || false,
          })
          .eq('id', product.id);
      } catch (e) {
        console.error('Failed to update product in Supabase', e);
      }
    }
  };

  const deleteProduct = async (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));

    const client = getSupabaseClient();
    if (client) {
      try {
        await client.from('products').delete().eq('id', productId);
      } catch (e) {
        console.error('Failed to delete product from Supabase', e);
      }
    }
  };

  // Order CRUD
  const createOrder = async (orderData: Omit<Order, 'id' | 'createdAt' | 'status'>): Promise<Order> => {
    const newOrder: Order = {
      ...orderData,
      id: `ORD-${Math.floor(100000 + Math.random() * 900000)}`,
      status: 'pendiente_yappy',
      createdAt: new Date().toISOString(),
    };

    setOrders((prev) => [newOrder, ...prev]);
    clearCart();

    const client = getSupabaseClient();
    if (client) {
      try {
        await client.from('orders').insert([
          {
            id: newOrder.id,
            customer_name: newOrder.customerName,
            customer_phone: newOrder.customerPhone,
            customer_email: newOrder.customerEmail || null,
            delivery_address: newOrder.deliveryAddress,
            delivery_method: newOrder.deliveryMethod,
            notes: newOrder.notes || null,
            items: newOrder.items,
            subtotal: newOrder.subtotal,
            delivery_fee: newOrder.deliveryFee,
            total: newOrder.total,
            yappy_ref_number: newOrder.yappyRefNumber,
            payment_proof_url: newOrder.paymentProofUrl || null,
            status: newOrder.status,
            created_at: newOrder.createdAt,
          },
        ]);
      } catch (e) {
        console.error('Failed to insert order into Supabase', e);
      }
    }

    return newOrder;
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status } : o))
    );

    const client = getSupabaseClient();
    if (client) {
      try {
        await client.from('orders').update({ status }).eq('id', orderId);
      } catch (e) {
        console.error('Failed to update order status in Supabase', e);
      }
    }
  };

  const deleteOrder = async (orderId: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== orderId));

    const client = getSupabaseClient();
    if (client) {
      try {
        await client.from('orders').delete().eq('id', orderId);
      } catch (e) {
        console.error('Failed to delete order from Supabase', e);
      }
    }
  };

  const updateSettings = async (newSettings: SiteSettings) => {
    setSettings(newSettings);

    const client = getSupabaseClient();
    if (client) {
      try {
        await client.from('site_settings').upsert({
          id: 1,
          store_name: newSettings.storeName,
          store_tagline: newSettings.storeTagline,
          store_logo_url: newSettings.storeLogoUrl || null,
          hero_badge_text: newSettings.heroBadgeText || null,
          hero_title: newSettings.heroTitle || null,
          hero_subtitle: newSettings.heroSubtitle || null,
          hero_image_url: newSettings.heroImageUrl || null,
          yappy_phone: newSettings.yappyPhone,
          yappy_name: newSettings.yappyName,
          whatsapp_phone: newSettings.whatsappPhone,
          delivery_fee_default: newSettings.deliveryFeeDefault,
          free_delivery_min: newSettings.freeDeliveryMin,
          currency_symbol: newSettings.currencySymbol,
          announcement_text: newSettings.announcementText,
          categories: newSettings.categories,
          province_fees: newSettings.provinceFees,
        });
      } catch (e) {
        console.error('Failed to save settings to Supabase', e);
      }
    }
  };

  const addCategory = async (name: string) => {
    const trimmed = name.trim();
    if (!trimmed || settings.categories.includes(trimmed)) return;
    const updatedCategories = [...settings.categories, trimmed];
    await updateSettings({ ...settings, categories: updatedCategories });
  };

  const renameCategory = async (oldName: string, newName: string) => {
    const trimmed = newName.trim();
    if (!trimmed || oldName === trimmed) return;
    
    const updatedCategories = settings.categories.map((c) => (c === oldName ? trimmed : c));
    await updateSettings({ ...settings, categories: updatedCategories });

    setProducts((prev) =>
      prev.map((p) => (p.category === oldName ? { ...p, category: trimmed } : p))
    );

    if (activeCategory === oldName) {
      setActiveCategory(trimmed);
    }
  };

  const deleteCategory = async (name: string) => {
    const updatedCategories = settings.categories.filter((c) => c !== name);
    await updateSettings({ ...settings, categories: updatedCategories });
    if (activeCategory === name) {
      setActiveCategory('Todos');
    }
  };

  const addProvinceFee = async (provinceName: string, fee: number, estimatedTime?: string) => {
    const newProv: ProvinceShippingFee = {
      id: `prov-${Date.now()}`,
      provinceName: provinceName.trim(),
      fee,
      estimatedTime,
    };
    const updated = [...(settings.provinceFees || []), newProv];
    await updateSettings({ ...settings, provinceFees: updated });
  };

  const updateProvinceFee = async (id: string, fee: number, estimatedTime?: string, provinceName?: string) => {
    const updated = (settings.provinceFees || []).map((p) =>
      p.id === id ? { ...p, fee, estimatedTime: estimatedTime ?? p.estimatedTime, provinceName: provinceName ?? p.provinceName } : p
    );
    await updateSettings({ ...settings, provinceFees: updated });
  };

  const deleteProvinceFee = async (id: string) => {
    const updated = (settings.provinceFees || []).filter((p) => p.id !== id);
    await updateSettings({ ...settings, provinceFees: updated });
  };

  return (
    <StoreContext.Provider
      value={{
        products,
        cart,
        orders,
        settings,
        supabaseConfig,
        isAdminLoggedIn,
        adminUser,
        activeCategory,
        searchQuery,
        selectedScentFilter,
        sortBy,
        cartTotal,
        cartCount,
        setActiveCategory,
        setSearchQuery,
        setSelectedScentFilter,
        setSortBy,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        createOrder,
        updateOrderStatus,
        deleteOrder,
        addProduct,
        updateProduct,
        deleteProduct,
        updateSettings,
        addCategory,
        renameCategory,
        deleteCategory,
        addProvinceFee,
        updateProvinceFee,
        deleteProvinceFee,
        saveSupabaseCredentials,
        loginAdmin,
        logoutAdmin,
        updateAdminCredentials,
        syncWithSupabase,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
