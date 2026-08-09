import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Product, Order, SiteSettings } from '../types';

const STORAGE_KEY_SUPABASE_CONFIG = 'auraluxe_supabase_config';

export interface StoredSupabaseConfig {
  url: string;
  anonKey: string;
}

export function getStoredSupabaseConfig(): StoredSupabaseConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SUPABASE_CONFIG);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Error reading Supabase config from localStorage', e);
  }

  // Fallback to environment variables if available
  const metaEnv = (import.meta as any).env || {};
  const envUrl = metaEnv.VITE_SUPABASE_URL || '';
  const envKey = metaEnv.VITE_SUPABASE_ANON_KEY || '';

  return {
    url: envUrl,
    anonKey: envKey,
  };
}

export function saveStoredSupabaseConfig(config: StoredSupabaseConfig) {
  try {
    localStorage.setItem(STORAGE_KEY_SUPABASE_CONFIG, JSON.stringify(config));
  } catch (e) {
    console.error('Error saving Supabase config', e);
  }
}

let cachedClient: SupabaseClient | null = null;
let cachedConfigKey = '';

export function getSupabaseClient(): SupabaseClient | null {
  const config = getStoredSupabaseConfig();
  if (!config.url || !config.anonKey) {
    return null;
  }

  const currentKey = `${config.url}_${config.anonKey}`;
  if (cachedClient && cachedConfigKey === currentKey) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(config.url, config.anonKey);
    cachedConfigKey = currentKey;
    return cachedClient;
  } catch (err) {
    console.error('Failed to create Supabase client', err);
    return null;
  }
}

export async function testSupabaseConnection(url: string, anonKey: string): Promise<{ success: boolean; message: string }> {
  if (!url || !anonKey) {
    return { success: false, message: 'La URL y la Anon Key son requeridas.' };
  }

  try {
    const testClient = createClient(url, anonKey);
    // Simple fetch on a table or health check
    const { error } = await testClient.from('products').select('id').limit(1);
    
    if (error && error.code !== 'PGRST116' && !error.message.includes('relation "public.products" does not exist')) {
      return { success: false, message: `Error de conexión: ${error.message}` };
    }

    return { 
      success: true, 
      message: 'Conexión con Supabase establecida correctamente.' 
    };
  } catch (e: any) {
    return { success: false, message: e?.message || 'Error al conectar con Supabase' };
  }
}

export const SUPABASE_SQL_SCHEMA = `-- Copia y ejecuta este script completo en el Editor SQL de tu proyecto en Supabase (supabase.com)
-- Abre Supabase -> Tu Proyecto -> SQL Editor -> New Query -> Pegar este código -> Run

-- 1. Tabla de Productos del Catálogo
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price NUMERIC NOT NULL,
  original_price NUMERIC,
  description TEXT NOT NULL,
  scent_notes TEXT[],
  volume TEXT,
  image TEXT NOT NULL,
  in_stock BOOLEAN DEFAULT true,
  is_best_seller BOOLEAN DEFAULT false,
  is_new BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabla de Transacciones y Pedidos Yappy
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  delivery_address TEXT NOT NULL,
  delivery_method TEXT NOT NULL,
  notes TEXT,
  items JSONB NOT NULL,
  subtotal NUMERIC NOT NULL,
  delivery_fee NUMERIC NOT NULL,
  total NUMERIC NOT NULL,
  yappy_ref_number TEXT NOT NULL,
  payment_proof_url TEXT,
  status TEXT NOT NULL DEFAULT 'pendiente_yappy',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabla de Configuración de la Tienda y Portada
CREATE TABLE IF NOT EXISTS public.site_settings (
  id INT PRIMARY KEY DEFAULT 1,
  store_name TEXT NOT NULL DEFAULT 'Aura Luxe',
  store_tagline TEXT DEFAULT 'Perfumes, Splash & Cuidado Personal Exclusivo',
  store_logo_url TEXT,
  hero_badge_text TEXT DEFAULT 'Colección Exclusiva de Belleza & Fragancias',
  hero_title TEXT DEFAULT 'Descubre la fragancia que enamora tu estilo',
  hero_subtitle TEXT DEFAULT 'Perfumes finos, mists ligeros, cremas hidratantes, lociones de sedas y jabones artesanales. Paga directo y seguro mediante Yappy con envíos directos en todo Panamá.',
  hero_image_url TEXT DEFAULT 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=600',
  yappy_phone TEXT NOT NULL DEFAULT '+507 6900-1234',
  yappy_name TEXT NOT NULL DEFAULT 'Aura Luxe Panamá',
  whatsapp_phone TEXT NOT NULL DEFAULT '+507 6900-1234',
  delivery_fee_default NUMERIC DEFAULT 3.50,
  free_delivery_min NUMERIC DEFAULT 50.00,
  currency_symbol TEXT DEFAULT '$',
  announcement_text TEXT DEFAULT '✨ Envíos a todo Panamá | Envío GRATIS en compras mayores a $50.00',
  categories JSONB DEFAULT '["Perfumes", "Splash", "Cremas", "Lociones", "Jabones"]'::jsonb,
  province_fees JSONB DEFAULT '[
    {"id": "prov-1", "provinceName": "Panamá Centro / San Miguelito", "fee": 3.50, "estimatedTime": "24 horas"},
    {"id": "prov-2", "provinceName": "Panamá Oeste (Arraiján / La Chorrera)", "fee": 4.00, "estimatedTime": "24-48 horas"},
    {"id": "prov-3", "provinceName": "Chiriquí (David, Boquete)", "fee": 5.50, "estimatedTime": "24-48 horas por Uno Express / Fletes"},
    {"id": "prov-4", "provinceName": "Provincias Centrales (Coclé, Herrera, Los Santos, Veraguas)", "fee": 5.00, "estimatedTime": "24-48 horas"},
    {"id": "prov-5", "provinceName": "Colón", "fee": 4.50, "estimatedTime": "24-48 horas"},
    {"id": "prov-6", "provinceName": "Bocas del Toro / Comarcas", "fee": 6.00, "estimatedTime": "48-72 horas"}
  ]'::jsonb
);

-- Asegurar columnas si la tabla ya existía
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS store_logo_url TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS hero_badge_text TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS hero_title TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS hero_subtitle TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS hero_image_url TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS categories JSONB;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS province_fees JSONB;

-- Insertar fila base por defecto de configuración si no existe
INSERT INTO public.site_settings (id, store_name, yappy_phone, yappy_name, whatsapp_phone)
VALUES (1, 'Aura Luxe', '+507 6900-1234', 'Aura Luxe Panamá', '+507 6900-1234')
ON CONFLICT (id) DO NOTHING;

-- 4. Tabla de Usuarios Administradores para el Sistema de Login
CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY DEFAULT 'admin-1',
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insertar credenciales de administración por defecto (Angela28 / 1234578)
INSERT INTO public.users (id, username, password)
VALUES ('admin-1', 'Angela28', '1234578')
ON CONFLICT (id) DO NOTHING;

-- Habilitar permisos de lectura y escritura para acceso público (Row Level Security)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Acceso publico productos" ON public.products;
CREATE POLICY "Acceso publico productos" ON public.products FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acceso publico pedidos" ON public.orders;
CREATE POLICY "Acceso publico pedidos" ON public.orders FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acceso publico configuracion" ON public.site_settings;
CREATE POLICY "Acceso publico configuracion" ON public.site_settings FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acceso publico usuarios" ON public.users;
CREATE POLICY "Acceso publico usuarios" ON public.users FOR ALL USING (true) WITH CHECK (true);
`;
