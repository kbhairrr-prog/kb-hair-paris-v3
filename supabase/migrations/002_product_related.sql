-- ============================================================
-- KB HAIR PARIS — MIGRATION 002
-- Table produits associés + index performances
-- ============================================================

-- Table produits associés (configurables depuis l'admin)
CREATE TABLE IF NOT EXISTS product_related (
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  related_id  UUID REFERENCES products(id) ON DELETE CASCADE,
  position    INTEGER DEFAULT 0,
  PRIMARY KEY (product_id, related_id)
);

CREATE INDEX IF NOT EXISTS idx_product_related_product ON product_related(product_id);

-- RLS pour product_related (lecture publique)
ALTER TABLE product_related ENABLE ROW LEVEL SECURITY;

CREATE POLICY "product_related_public_read" ON product_related
  FOR SELECT USING (TRUE);

-- Mettre à jour la query des produits associés dans le code :
-- Au lieu de chercher par même catégorie, chercher d'abord dans product_related
-- puis compléter avec la même catégorie si moins de 6 résultats

-- Vue utile pour les produits associés avec fallback catégorie
CREATE OR REPLACE VIEW product_related_with_fallback AS
SELECT 
  pr.product_id,
  pr.related_id AS id,
  pr.position,
  'manual' AS source
FROM product_related pr
UNION ALL
SELECT
  p.id AS product_id,
  p2.id AS related_id,
  p2.created_at::text::integer % 100 AS position,
  'auto' AS source
FROM products p
JOIN products p2 ON p2.category_id = p.category_id 
  AND p2.id != p.id 
  AND p2.is_active = TRUE
WHERE NOT EXISTS (
  SELECT 1 FROM product_related pr2 
  WHERE pr2.product_id = p.id AND pr2.related_id = p2.id
);

-- ============================================================
-- Index supplémentaires pour les performances
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_products_is_new        ON products(is_new);
CREATE INDEX IF NOT EXISTS idx_products_total_sold    ON products(total_sold);
CREATE INDEX IF NOT EXISTS idx_reviews_product_approved ON product_reviews(product_id, is_approved);
CREATE INDEX IF NOT EXISTS idx_newsletter_locale      ON newsletter(locale, is_active);
CREATE INDEX IF NOT EXISTS idx_promo_codes_active     ON promo_codes(is_active, code);
CREATE INDEX IF NOT EXISTS idx_order_items_order      ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_wishlists_customer     ON wishlists(customer_id);
