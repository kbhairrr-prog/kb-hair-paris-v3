// ============================================================
// KB HAIR PARIS — TYPES TYPESCRIPT COMPLETS
// ============================================================

export type Locale = 'fr' | 'en'

// ─── PRODUITS ───────────────────────────────────────────────

export interface Product {
  id: string
  slug: string
  name_fr: string
  name_en: string
  description_fr?: string
  description_en?: string
  short_desc_fr?: string
  short_desc_en?: string
  category_id?: string
  category?: Category
  price: number
  compare_price?: number
  sku?: string
  track_inventory: boolean
  allow_backorder: boolean
  is_active: boolean
  is_featured: boolean
  is_new: boolean
  is_bestseller: boolean
  tags: string[]
  images: ProductImage[]
  variants: ProductVariant[]
  faqs?: ProductFAQ[]
  related_products?: Product[]
  total_sold: number
  rating_avg: number
  rating_count: number
  seo_title_fr?: string
  seo_title_en?: string
  seo_desc_fr?: string
  seo_desc_en?: string
  created_at: string
  updated_at: string
}

export interface ProductImage {
  id: string
  product_id: string
  url: string
  alt_fr?: string
  alt_en?: string
  position: number
  is_primary: boolean
  type: 'image' | 'video'
}

export interface ProductVariant {
  id: string
  product_id: string
  sku?: string
  price?: number
  compare_price?: number
  stock: number
  is_active: boolean
  position: number
  options: VariantOption[]
  label?: string  // Calculé côté client
}

export interface VariantType {
  id: string
  name_fr: string
  name_en: string
  slug: string
  position: number
  is_active: boolean
}

export interface VariantOption {
  id: string
  variant_type_id: string
  variant_type?: VariantType
  value_fr: string
  value_en: string
  color_hex?: string
  position: number
}

export interface ProductFAQ {
  id: string
  product_id: string
  question_fr: string
  question_en: string
  answer_fr: string
  answer_en: string
  position: number
}

// ─── CATÉGORIES ─────────────────────────────────────────────

export interface Category {
  id: string
  slug: string
  name_fr: string
  name_en: string
  description_fr?: string
  description_en?: string
  image_url?: string
  banner_url?: string
  parent_id?: string
  position: number
  is_active: boolean
  products?: Product[]
  created_at: string
}

// ─── CLIENTS ────────────────────────────────────────────────

export interface Customer {
  id: string
  supabase_uid?: string
  email: string
  first_name?: string
  last_name?: string
  phone?: string
  birthday?: string
  locale: Locale
  vip_level: 'none' | 'bronze' | 'silver' | 'gold'
  total_spent: number
  order_count: number
  points: number
  stripe_customer_id?: string
  is_active: boolean
  created_at: string
}

export interface CustomerAddress {
  id: string
  customer_id: string
  label: string
  first_name?: string
  last_name?: string
  address1: string
  address2?: string
  city: string
  zip: string
  country: string
  phone?: string
  is_default: boolean
}

// ─── COMMANDES ──────────────────────────────────────────────

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded'

export type PaymentStatus =
  | 'unpaid'
  | 'paid'
  | 'partially_refunded'
  | 'refunded'

export interface Order {
  id: string
  order_number: string
  customer_id?: string
  customer?: Customer
  guest_email?: string
  status: OrderStatus
  payment_status: PaymentStatus
  payment_method?: 'stripe' | 'paypal'
  subtotal: number
  discount_amount: number
  shipping_amount: number
  tax_amount: number
  total: number
  currency: string
  shipping_address?: Address
  billing_address?: Address
  shipping_method?: string
  tracking_number?: string
  promo_code?: string
  promo_discount: number
  customer_note?: string
  items: OrderItem[]
  locale: Locale
  created_at: string
  updated_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  product_id?: string
  variant_id?: string
  product_name: string
  variant_label?: string
  image_url?: string
  quantity: number
  unit_price: number
  total_price: number
}

export interface Address {
  first_name: string
  last_name: string
  address1: string
  address2?: string
  city: string
  zip: string
  country: string
  phone?: string
}

// ─── PANIER ─────────────────────────────────────────────────

export interface CartItem {
  id: string           // UUID local
  product_id: string
  variant_id?: string
  product: Product
  variant?: ProductVariant
  quantity: number
  unit_price: number
  total_price: number
}

export interface Cart {
  items: CartItem[]
  subtotal: number
  discount_amount: number
  shipping_amount: number
  total: number
  promo_code?: string
  promo_applied?: PromoCode
}

// ─── CODES PROMO ────────────────────────────────────────────

export interface PromoCode {
  id: string
  code: string
  type: 'percentage' | 'fixed' | 'free_shipping'
  value: number
  description_fr?: string
  description_en?: string
  min_order_amount: number
  max_uses?: number
  used_count: number
  starts_at: string
  expires_at?: string
  is_influencer: boolean
  is_active: boolean
}

// ─── VIP ────────────────────────────────────────────────────

export interface VIPConfig {
  level: 'bronze' | 'silver' | 'gold'
  label_fr: string
  label_en: string
  min_spend: number
  discount_pct: number
  free_shipping: boolean
  early_access: boolean
  perks_fr: string[]
  perks_en: string[]
  color: string
}

// ─── HOMEPAGE ───────────────────────────────────────────────

export type SectionType =
  | 'hero'
  | 'carousel'
  | 'collection'
  | 'banner'
  | 'text'
  | 'video'
  | 'testimonials'
  | 'newsletter'

export interface HomepageSection {
  id: string
  type: SectionType
  title?: string
  content: Record<string, unknown>
  position: number
  is_active: boolean
}

// ─── NAVIGATION ─────────────────────────────────────────────

export interface MenuItem {
  id: string
  menu_id: string
  parent_id?: string
  label_fr: string
  label_en: string
  url?: string
  position: number
  is_active: boolean
  children?: MenuItem[]
}

// ─── REVIEWS ────────────────────────────────────────────────

export interface ProductReview {
  id: string
  product_id: string
  customer_id?: string
  customer?: Customer
  rating: number
  title?: string
  body?: string
  is_verified: boolean
  is_approved: boolean
  created_at: string
}

// ─── HELPERS ────────────────────────────────────────────────

export type WithLocale<T extends Record<string, unknown>> = T & { locale: Locale }

// Localiser un objet (name_fr/name_en → name)
export function localize<T>(obj: T, locale: Locale, field: string): string {
  const key = `${field}_${locale}` as keyof T
  const fallback = `${field}_fr` as keyof T
  return (obj[key] as string) || (obj[fallback] as string) || ''
}
