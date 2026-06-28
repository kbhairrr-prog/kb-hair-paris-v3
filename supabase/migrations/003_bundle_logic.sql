-- ============================================================
-- KB HAIR PARIS — MIGRATION 003
-- Logique des lots (bundles) sur les produits
-- ============================================================

-- Ajouter les colonnes de lot sur la table products
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS bundle_size     INTEGER DEFAULT NULL,
  -- NULL = pas de lot, 2 = vendu par 2, 3 = vendu par 3, etc.
  ADD COLUMN IF NOT EXISTS bundle_label_fr TEXT DEFAULT NULL,
  -- ex: "Lot de 3 tissages" (optionnel, généré automatiquement si vide)
  ADD COLUMN IF NOT EXISTS bundle_label_en TEXT DEFAULT NULL,
  -- ex: "Bundle of 3"
  ADD COLUMN IF NOT EXISTS stock          INTEGER DEFAULT 0;
  -- stock global (déjà présent dans certaines versions, sinon ajouté ici)

-- Ajouter display_order si absent
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

-- Index pour les lots (filtrer rapidement les produits en lot)
CREATE INDEX IF NOT EXISTS idx_products_bundle ON products(bundle_size) WHERE bundle_size IS NOT NULL;

-- Ajouter bundle_size dans order_items pour conserver l'info au moment de la commande
ALTER TABLE order_items
  ADD COLUMN IF NOT EXISTS bundle_size INTEGER DEFAULT NULL;
