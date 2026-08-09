export type ProductCategory = string;

export interface ProvinceShippingFee {
  id: string;
  provinceName: string;
  fee: number;
  estimatedTime?: string;
}

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  price: number;
  originalPrice?: number;
  description: string;
  scentNotes?: string[];
  volume?: string; // e.g. "250 ml", "100 ml"
  image: string;
  inStock: boolean;
  isBestSeller?: boolean;
  isNew?: boolean;
  createdAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedVolume?: string;
}

export type OrderStatus = 'pendiente_yappy' | 'verificando' | 'confirmado' | 'enviado' | 'completado' | 'cancelado';

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  deliveryAddress: string;
  deliveryMethod: 'domicilio' | 'pickup';
  notes?: string;
  items: {
    productId: string;
    productName: string;
    price: number;
    quantity: number;
    volume?: string;
    image: string;
  }[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  yappyRefNumber: string;
  paymentProofUrl?: string;
  status: OrderStatus;
  createdAt: string;
}

export interface SiteSettings {
  storeName: string;
  storeTagline: string;
  storeLogoUrl?: string;
  heroBadgeText?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  heroImageUrl?: string;
  yappyPhone: string;
  yappyName: string;
  whatsappPhone: string;
  deliveryFeeDefault: number;
  freeDeliveryMin: number;
  currencySymbol: string;
  announcementText: string;
  categories: string[];
  provinceFees: ProvinceShippingFee[];
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConnected: boolean;
}

export interface AdminUser {
  id?: string;
  username: string;
  password: string;
}
