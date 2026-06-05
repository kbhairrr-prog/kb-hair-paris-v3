-- ============================================================
-- KB HAIR PARIS — SUPABASE DATABASE SCHEMA
-- Version 3.0 — Production Ready
-- ============================================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- SECTION 1 : SITE SETTINGS (100% administrable)
-- ============================================================

CREATE TABLE site_settings (
  id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  key         TEXT UNIQUE NOT NULL,
  value       JSONB NOT NULL DEFAULT '{}',
  description TEXT,
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Paramètres par défaut
INSERT INTO site_settings (key, value, description) VALUES
('brand', '{
  "name": "KB Hair Paris",
  "tagline_fr": "L''art de la beauté capillaire",
  "tagline_en": "The art of hair beauty",
  "email": "contact@kbhair.fr",
  "phone": "+33 1 00 00 00 00",
  "address": "Paris, France"
}', 'Identité de marque'),
('shipping', '{
  "free_threshold": 230,
  "currency": "EUR",
  "delay_fr": "3 à 5 jours ouvrés",
  "delay_en": "3 to 5 business days",
  "zones": [
    {"name": "France", "price": 6.90},
    {"name": "Europe", "price": 12.90},
    {"name": "International", "price": 24.90}
  ]
}', 'Configuration livraison'),
('social', '{
  "instagram": "https://instagram.com/kbhairparis",
  "tiktok": "https://tiktok.com/@kbhairparis",
  "facebook": "https://facebook.com/kbhairparis",
  "youtube": ""
}', 'Réseaux sociaux'),
('seo', '{
  "title_fr": "KB Hair Paris — Extensions & Perruques Premium",
  "title_en": "KB Hair Paris — Premium Hair Extensions & Wigs",
  "description_fr": "Découvrez KB Hair Paris, votre destination premium pour extensions capillaires et perruques de qualité supérieure.",
  "description_en": "Discover KB Hair Paris, your premium destination for superior quality hair extensions and wigs.",
  "og_image": ""
}', 'SEO global');

-- ============================================================
-- SECTION 2 : NAVIGATION & MENUS
-- ============================================================

CREATE TABLE menus (
  id         UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  handle     TEXT UNIQUE NOT NULL,
  label_fr   TEXT NOT NULL,
  label_en   TEXT NOT NULL,
  position   INTEGER DEFAULT 0,
  is_active  BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE menu_items (
  id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  menu_id     UUID REFERENCES menus(id) ON DELETE CASCADE,
  parent_id   UUID REFERENCES menu_items(id) ON DELETE CASCADE,
  label_fr    TEXT NOT NULL,
  label_en    TEXT NOT NULL,
  url         TEXT,
  position    INTEGER DEFAULT 0,
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Menu principal (comme Bright Hair Paris)
INSERT INTO menus (handle, label_fr, label_en, position) VALUES
('main', 'Menu principal', 'Main menu', 1),
('footer', 'Pied de page', 'Footer', 2);

-- ============================================================
-- SECTION 3 : CATEGORIES & COLLECTIONS
-- ============================================================

CREATE TABLE categories (
  id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  slug        TEXT UNIQUE NOT NULL,
  name_fr     TEXT NOT NULL,
  name_en     TEXT NOT NULL,
  description_fr TEXT,
  description_en TEXT,
  image_url   TEXT,
  banner_url  TEXT,
  parent_id   UUID REFERENCES categories(id),
  position    INTEGER DEFAULT 0,
  is_active   BOOLEAN DEFAULT TRUE,
  seo_title_fr      TEXT,
  seo_title_en      TEXT,
  seo_description_fr TEXT,
  seo_description_en TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Catégories KB Hair (comme Bright Hair)
INSERT INTO categories (slug, name_fr, name_en, position) VALUES
('wigs',       'Wigs',                'Wigs',               1),
('bundles',    'Tissages',            'Bundles',             2),
('frontales',  'Frontales',          'Frontals',            3),
('closures',   'Closures',           'Closures',            4),
('produits',   'Produits Capillaires','Hair Products',       5),
('accessoires','Accessoires',        'Accessories',         6),
('vip-cards',  'Cartes VIP',         'VIP Cards',           7);

-- ============================================================
-- SECTION 4 : PRODUITS
-- ============================================================

CREATE TABLE products (
  id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  slug            TEXT UNIQUE NOT NULL,
  name_fr         TEXT NOT NULL,
  name_en         TEXT NOT NULL,
  description_fr  TEXT,
  description_en  TEXT,
  short_desc_fr   TEXT,
  short_desc_en   TEXT,
  category_id     UUID REFERENCES categories(id),
  price           DECIMAL(10,2) NOT NULL,
  compare_price   DECIMAL(10,2),
  cost_price      DECIMAL(10,2),
  sku             TEXT UNIQUE,
  barcode         TEXT,
  track_inventory BOOLEAN DEFAULT TRUE,
  allow_backorder BOOLEAN DEFAULT FALSE,
  weight_g        INTEGER,
  is_active       BOOLEAN DEFAULT TRUE,
  is_featured     BOOLEAN DEFAULT FALSE,
  is_new          BOOLEAN DEFAULT FALSE,
  is_bestseller   BOOLEAN DEFAULT FALSE,
  tags            TEXT[] DEFAULT '{}',
  -- SEO
  seo_title_fr    TEXT,
  seo_title_en    TEXT,
  seo_desc_fr     TEXT,
  seo_desc_en     TEXT,
  -- Stats
  total_sold      INTEGER DEFAULT 0,
  view_count      INTEGER DEFAULT 0,
  rating_avg      DECIMAL(3,2) DEFAULT 0,
  rating_count    INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SECTION 5 : VARIANTES DYNAMIQUES
-- ============================================================

-- Types de variantes (admin peut en créer librement)
CREATE TABLE variant_types (
  id       UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name_fr  TEXT NOT NULL,  -- "Longueur", "Texture", etc.
  name_en  TEXT NOT NULL,
  slug     TEXT UNIQUE NOT NULL,
  position INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE
);

INSERT INTO variant_types (name_fr, name_en, slug, position) VALUES
('Longueur',   'Length',    'length',   1),
('Couleur',    'Color',     'color',    2),
('Texture',    'Texture',   'texture',  3),
('Densité',    'Density',   'density',  4),
('Type de lace','Lace Type','lace-type',5);

-- Options de variantes (admin peut en créer librement)
CREATE TABLE variant_options (
  id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  variant_type_id UUID REFERENCES variant_types(id) ON DELETE CASCADE,
  value_fr        TEXT NOT NULL,
  value_en        TEXT NOT NULL,
  color_hex       TEXT,  -- Pour les couleurs
  position        INTEGER DEFAULT 0,
  is_active       BOOLEAN DEFAULT TRUE
);

-- Variantes produit (combinaisons)
CREATE TABLE product_variants (
  id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id      UUID REFERENCES products(id) ON DELETE CASCADE,
  sku             TEXT,
  price           DECIMAL(10,2),  -- Surcharge ou prix propre
  compare_price   DECIMAL(10,2),
  stock           INTEGER DEFAULT 0,
  is_active       BOOLEAN DEFAULT TRUE,
  position        INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Association variante <-> options
CREATE TABLE product_variant_options (
  variant_id UUID REFERENCES product_variants(id) ON DELETE CASCADE,
  option_id  UUID REFERENCES variant_options(id) ON DELETE CASCADE,
  PRIMARY KEY (variant_id, option_id)
);

-- ============================================================
-- SECTION 6 : IMAGES PRODUITS
-- ============================================================

CREATE TABLE product_images (
  id         UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  url        TEXT NOT NULL,
  alt_fr     TEXT,
  alt_en     TEXT,
  position   INTEGER DEFAULT 0,
  is_primary BOOLEAN DEFAULT FALSE,
  type       TEXT DEFAULT 'image'  -- 'image' | 'video'
);

-- ============================================================
-- SECTION 7 : FAQ PRODUITS
-- ============================================================

CREATE TABLE product_faqs (
  id         UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  question_fr TEXT NOT NULL,
  question_en TEXT NOT NULL,
  answer_fr   TEXT NOT NULL,
  answer_en   TEXT NOT NULL,
  position    INTEGER DEFAULT 0
);

-- ============================================================
-- SECTION 8 : HOMEPAGE PAGE BUILDER
-- ============================================================

CREATE TABLE homepage_sections (
  id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  type        TEXT NOT NULL,  -- 'hero' | 'carousel' | 'banner' | 'collection' | 'text' | 'video' | 'testimonials'
  title       TEXT,
  content     JSONB NOT NULL DEFAULT '{}',
  position    INTEGER DEFAULT 0,
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Sections homepage par défaut
INSERT INTO homepage_sections (type, title, content, position, is_active) VALUES
('hero', 'Hero Principal', '{
  "title_fr": "L''art de la beauté capillaire",
  "title_en": "The art of hair beauty",
  "subtitle_fr": "Extensions & Perruques Premium — Paris",
  "subtitle_en": "Premium Hair Extensions & Wigs — Paris",
  "cta_fr": "Découvrir",
  "cta_en": "Discover",
  "cta_url": "/collections",
  "image_url": "",
  "video_url": "",
  "overlay_opacity": 0.3
}', 1, TRUE),
('collection', 'Nos Collections', '{
  "title_fr": "Nos Collections",
  "title_en": "Our Collections",
  "subtitle_fr": "Qualité premium, style intemporel",
  "subtitle_en": "Premium quality, timeless style",
  "categories": ["wigs", "bundles", "frontales", "closures"]
}', 2, TRUE),
('banner', 'Bannière Livraison', '{
  "text_fr": "Livraison gratuite dès 230€ — 3 à 5 jours ouvrés",
  "text_en": "Free shipping from €230 — 3 to 5 business days",
  "bg_color": "#0A0A0A",
  "text_color": "#C9A84C"
}', 3, TRUE),
('testimonials', 'Avis Clients', '{
  "title_fr": "Ce que disent nos clientes",
  "title_en": "What our clients say",
  "items": []
}', 4, TRUE);

-- ============================================================
-- SECTION 9 : CLIENTS & AUTH
-- ============================================================

CREATE TABLE customers (
  id            UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  supabase_uid  UUID UNIQUE,  -- Lié à auth.users
  email         TEXT UNIQUE NOT NULL,
  first_name    TEXT,
  last_name     TEXT,
  phone         TEXT,
  birthday      DATE,
  locale        TEXT DEFAULT 'fr',
  -- VIP System
  vip_level     TEXT DEFAULT 'none',  -- 'none' | 'bronze' | 'silver' | 'gold'
  total_spent   DECIMAL(10,2) DEFAULT 0,
  order_count   INTEGER DEFAULT 0,
  points        INTEGER DEFAULT 0,
  -- Stripe
  stripe_customer_id TEXT,
  -- Meta
  is_active     BOOLEAN DEFAULT TRUE,
  notes         TEXT,  -- Notes admin
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE customer_addresses (
  id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  label       TEXT DEFAULT 'Domicile',
  first_name  TEXT,
  last_name   TEXT,
  address1    TEXT NOT NULL,
  address2    TEXT,
  city        TEXT NOT NULL,
  zip         TEXT NOT NULL,
  country     TEXT NOT NULL DEFAULT 'FR',
  phone       TEXT,
  is_default  BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SECTION 10 : COMMANDES
-- ============================================================

CREATE TABLE orders (
  id               UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_number     TEXT UNIQUE NOT NULL,
  customer_id      UUID REFERENCES customers(id),
  guest_email      TEXT,
  status           TEXT DEFAULT 'pending',
  -- 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
  payment_status   TEXT DEFAULT 'unpaid',
  -- 'unpaid' | 'paid' | 'partially_refunded' | 'refunded'
  payment_method   TEXT,  -- 'stripe' | 'paypal'
  stripe_payment_intent TEXT,
  paypal_order_id  TEXT,
  -- Montants
  subtotal         DECIMAL(10,2) NOT NULL,
  discount_amount  DECIMAL(10,2) DEFAULT 0,
  shipping_amount  DECIMAL(10,2) DEFAULT 0,
  tax_amount       DECIMAL(10,2) DEFAULT 0,
  total            DECIMAL(10,2) NOT NULL,
  currency         TEXT DEFAULT 'EUR',
  -- Adresses
  shipping_address JSONB,
  billing_address  JSONB,
  -- Livraison
  shipping_method  TEXT,
  tracking_number  TEXT,
  shipped_at       TIMESTAMPTZ,
  delivered_at     TIMESTAMPTZ,
  -- Codes promo
  promo_code       TEXT,
  promo_discount   DECIMAL(10,2) DEFAULT 0,
  -- Notes
  customer_note    TEXT,
  admin_note       TEXT,
  -- Locale
  locale           TEXT DEFAULT 'fr',
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-incrément numéro commande
CREATE SEQUENCE order_number_seq START 1000;
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.order_number := 'KB-' || LPAD(nextval('order_number_seq')::TEXT, 6, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_order_number
  BEFORE INSERT ON orders
  FOR EACH ROW EXECUTE FUNCTION generate_order_number();

CREATE TABLE order_items (
  id               UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id         UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id       UUID REFERENCES products(id),
  variant_id       UUID REFERENCES product_variants(id),
  product_name     TEXT NOT NULL,
  variant_label    TEXT,
  image_url        TEXT,
  quantity         INTEGER NOT NULL,
  unit_price       DECIMAL(10,2) NOT NULL,
  total_price      DECIMAL(10,2) NOT NULL
);

-- Historique statuts
CREATE TABLE order_status_history (
  id         UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id   UUID REFERENCES orders(id) ON DELETE CASCADE,
  status     TEXT NOT NULL,
  note       TEXT,
  created_by TEXT,  -- 'system' | 'admin' | email
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SECTION 11 : CODES PROMO
-- ============================================================

CREATE TABLE promo_codes (
  id                UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  code              TEXT UNIQUE NOT NULL,
  type              TEXT NOT NULL,  -- 'percentage' | 'fixed' | 'free_shipping'
  value             DECIMAL(10,2) NOT NULL,
  description_fr    TEXT,
  description_en    TEXT,
  -- Conditions
  min_order_amount  DECIMAL(10,2) DEFAULT 0,
  max_uses          INTEGER,
  max_uses_per_customer INTEGER DEFAULT 1,
  used_count        INTEGER DEFAULT 0,
  -- Validité
  starts_at         TIMESTAMPTZ DEFAULT NOW(),
  expires_at        TIMESTAMPTZ,
  -- Type influenceur
  is_influencer     BOOLEAN DEFAULT FALSE,
  influencer_name   TEXT,
  influencer_email  TEXT,
  -- State
  is_active         BOOLEAN DEFAULT TRUE,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE promo_code_uses (
  id           UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  code_id      UUID REFERENCES promo_codes(id),
  order_id     UUID REFERENCES orders(id),
  customer_id  UUID REFERENCES customers(id),
  used_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SECTION 12 : VIP SYSTEM
-- ============================================================

CREATE TABLE vip_config (
  level           TEXT PRIMARY KEY,  -- 'bronze' | 'silver' | 'gold'
  label_fr        TEXT NOT NULL,
  label_en        TEXT NOT NULL,
  min_spend       DECIMAL(10,2) NOT NULL,
  discount_pct    INTEGER DEFAULT 0,
  free_shipping   BOOLEAN DEFAULT FALSE,
  early_access    BOOLEAN DEFAULT FALSE,
  perks_fr        TEXT[],
  perks_en        TEXT[],
  color           TEXT DEFAULT '#C9A84C',
  position        INTEGER DEFAULT 0
);

INSERT INTO vip_config VALUES
('bronze', 'Bronze', 'Bronze', 200, 5, FALSE, FALSE, 
 ARRAY['5% de réduction sur toutes les commandes', 'Accès aux ventes privées'],
 ARRAY['5% discount on all orders', 'Access to private sales'],
 '#CD7F32', 1),
('silver', 'Silver', 'Silver', 500, 10, FALSE, TRUE,
 ARRAY['10% de réduction sur toutes les commandes', 'Livraison prioritaire', 'Accès anticipé aux nouveautés'],
 ARRAY['10% discount on all orders', 'Priority shipping', 'Early access to new arrivals'],
 '#C0C0C0', 2),
('gold', 'Gold', 'Gold', 1000, 15, TRUE, TRUE,
 ARRAY['15% de réduction sur toutes les commandes', 'Livraison gratuite', 'Service client prioritaire', 'Cadeaux exclusifs'],
 ARRAY['15% discount on all orders', 'Free shipping', 'Priority customer service', 'Exclusive gifts'],
 '#C9A84C', 3);

-- ============================================================
-- SECTION 13 : NEWSLETTER
-- ============================================================

CREATE TABLE newsletter (
  id         UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email      TEXT UNIQUE NOT NULL,
  locale     TEXT DEFAULT 'fr',
  is_active  BOOLEAN DEFAULT TRUE,
  source     TEXT DEFAULT 'website',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SECTION 14 : AVIS PRODUITS
-- ============================================================

CREATE TABLE product_reviews (
  id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id  UUID REFERENCES products(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id),
  order_id    UUID REFERENCES orders(id),
  rating      INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title       TEXT,
  body        TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  is_approved BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SECTION 15 : PAGES LÉGALES & CONTENU
-- ============================================================

CREATE TABLE pages (
  id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  slug        TEXT UNIQUE NOT NULL,
  title_fr    TEXT NOT NULL,
  title_en    TEXT NOT NULL,
  content_fr  TEXT,
  content_en  TEXT,
  is_active   BOOLEAN DEFAULT TRUE,
  seo_title_fr TEXT,
  seo_title_en TEXT,
  seo_desc_fr  TEXT,
  seo_desc_en  TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO pages (slug, title_fr, title_en, content_fr, content_en) VALUES
('cgv',              'Conditions Générales de Vente',  'Terms of Sale',        'Contenu à compléter.', 'Content to complete.'),
('mentions-legales', 'Mentions Légales',               'Legal Notice',         'Contenu à compléter.', 'Content to complete.'),
('confidentialite',  'Politique de Confidentialité',   'Privacy Policy',       'Contenu à compléter.', 'Content to complete.'),
('livraison',        'Livraison & Retours',            'Shipping & Returns',   'Contenu à compléter.', 'Content to complete.'),
('qui-sommes-nous',  'Qui Sommes-Nous',                'About Us',             'Contenu à compléter.', 'Content to complete.');

-- ============================================================
-- SECTION 16 : WISHLIST
-- ============================================================

CREATE TABLE wishlists (
  id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  product_id  UUID REFERENCES products(id) ON DELETE CASCADE,
  variant_id  UUID REFERENCES product_variants(id),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(customer_id, product_id)
);

-- ============================================================
-- SECTION 17 : STOCK & INVENTAIRE
-- ============================================================

CREATE TABLE inventory_movements (
  id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  variant_id  UUID REFERENCES product_variants(id),
  quantity    INTEGER NOT NULL,
  type        TEXT NOT NULL,  -- 'in' | 'out' | 'adjustment'
  reason      TEXT,
  order_id    UUID REFERENCES orders(id),
  created_by  TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SECTION 18 : GUIDES & CONTENU ENRICHI
-- ============================================================

CREATE TABLE size_guides (
  id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  category_id UUID REFERENCES categories(id),
  title_fr    TEXT NOT NULL,
  title_en    TEXT NOT NULL,
  content     JSONB NOT NULL DEFAULT '[]',
  is_active   BOOLEAN DEFAULT TRUE
);

-- ============================================================
-- INDEXES PERFORMANCES
-- ============================================================

CREATE INDEX idx_products_category     ON products(category_id);
CREATE INDEX idx_products_slug         ON products(slug);
CREATE INDEX idx_products_is_active    ON products(is_active);
CREATE INDEX idx_products_is_featured  ON products(is_featured);
CREATE INDEX idx_variants_product      ON product_variants(product_id);
CREATE INDEX idx_images_product        ON product_images(product_id);
CREATE INDEX idx_orders_customer       ON orders(customer_id);
CREATE INDEX idx_orders_status         ON orders(status);
CREATE INDEX idx_orders_number         ON orders(order_number);
CREATE INDEX idx_customers_email       ON customers(email);
CREATE INDEX idx_customers_supabase    ON customers(supabase_uid);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE customers           ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_addresses  ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders              ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items         ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlists           ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter          ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_reviews     ENABLE ROW LEVEL SECURITY;

-- Clients : accès à leurs propres données uniquement
CREATE POLICY "customers_own_data" ON customers
  FOR ALL USING (supabase_uid = auth.uid());

CREATE POLICY "addresses_own_data" ON customer_addresses
  FOR ALL USING (
    customer_id IN (SELECT id FROM customers WHERE supabase_uid = auth.uid())
  );

CREATE POLICY "orders_own_data" ON orders
  FOR ALL USING (
    customer_id IN (SELECT id FROM customers WHERE supabase_uid = auth.uid())
    OR guest_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

CREATE POLICY "order_items_own_data" ON order_items
  FOR ALL USING (
    order_id IN (SELECT id FROM orders WHERE 
      customer_id IN (SELECT id FROM customers WHERE supabase_uid = auth.uid())
    )
  );

CREATE POLICY "wishlists_own_data" ON wishlists
  FOR ALL USING (
    customer_id IN (SELECT id FROM customers WHERE supabase_uid = auth.uid())
  );

CREATE POLICY "newsletter_insert" ON newsletter
  FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "newsletter_own_data" ON newsletter
  FOR SELECT USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- Reviews : lecture publique, écriture authentifiée
CREATE POLICY "reviews_public_read" ON product_reviews
  FOR SELECT USING (is_approved = TRUE);

CREATE POLICY "reviews_own_write" ON product_reviews
  FOR INSERT WITH CHECK (
    customer_id IN (SELECT id FROM customers WHERE supabase_uid = auth.uid())
  );

-- ============================================================
-- FONCTIONS UTILITAIRES
-- ============================================================

-- Mise à jour automatique updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER products_updated_at      BEFORE UPDATE ON products      FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER customers_updated_at     BEFORE UPDATE ON customers     FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER orders_updated_at        BEFORE UPDATE ON orders        FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER categories_updated_at    BEFORE UPDATE ON categories    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER homepage_sections_at     BEFORE UPDATE ON homepage_sections FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- VIP automatique selon total_spent
CREATE OR REPLACE FUNCTION update_customer_vip()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.total_spent >= 1000 THEN
    NEW.vip_level := 'gold';
  ELSIF NEW.total_spent >= 500 THEN
    NEW.vip_level := 'silver';
  ELSIF NEW.total_spent >= 200 THEN
    NEW.vip_level := 'bronze';
  ELSE
    NEW.vip_level := 'none';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_vip_level
  BEFORE UPDATE ON customers
  FOR EACH ROW
  WHEN (NEW.total_spent IS DISTINCT FROM OLD.total_spent)
  EXECUTE FUNCTION update_customer_vip();

-- Mise à jour stock après commande
CREATE OR REPLACE FUNCTION update_product_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE products
  SET 
    total_sold = total_sold + NEW.quantity,
    updated_at = NOW()
  WHERE id = NEW.product_id;
  
  UPDATE product_variants
  SET stock = stock - NEW.quantity
  WHERE id = NEW.variant_id AND NEW.variant_id IS NOT NULL;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_order_item_insert
  AFTER INSERT ON order_items
  FOR EACH ROW EXECUTE FUNCTION update_product_stats();

-- Rating moyen produit
CREATE OR REPLACE FUNCTION update_product_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE products
  SET 
    rating_avg   = (SELECT AVG(rating) FROM product_reviews WHERE product_id = NEW.product_id AND is_approved = TRUE),
    rating_count = (SELECT COUNT(*) FROM product_reviews WHERE product_id = NEW.product_id AND is_approved = TRUE),
    updated_at   = NOW()
  WHERE id = NEW.product_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_review_insert
  AFTER INSERT OR UPDATE ON product_reviews
  FOR EACH ROW EXECUTE FUNCTION update_product_rating();
