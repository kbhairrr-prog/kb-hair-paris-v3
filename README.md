# KB Hair Paris — V3

E-commerce premium extensions capillaires & perruques.  
Stack : Next.js 14 · TypeScript · Tailwind CSS · Supabase · Stripe · PayPal · Vercel

---

## Installation

```bash
# 1. Extraire l'archive
tar -xzf kb-hair-paris-final.tar.gz
cd kb-hair-paris

# 2. Installer les dépendances
npm install

# 3. Variables d'environnement
cp .env.example .env.local
# Remplir les clés dans .env.local

# 4. Base de données Supabase
# Ouvrir supabase/migrations/001_initial_schema.sql
# Exécuter dans l'éditeur SQL de Supabase

# 5. Storage Supabase
# Créer un bucket "products" (public)

# 6. Lancer en développement
npm run dev
```

---

## Variables d'environnement

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

NEXT_PUBLIC_PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...

NEXT_PUBLIC_APP_URL=https://kbhair.fr
```

---

## Structure du projet

```
src/
├── app/
│   ├── fr/                    # Pages françaises
│   │   ├── page.tsx           # Homepage FR
│   │   ├── collections/[slug] # Page collection
│   │   ├── produits/[slug]    # Fiche produit
│   │   ├── checkout/          # Tunnel d'achat
│   │   └── compte/            # Espace client
│   ├── en/                    # Pages anglaises (même structure)
│   ├── admin/                 # Panel d'administration
│   │   ├── page.tsx           # Dashboard
│   │   ├── produits/          # Gestion produits
│   │   ├── commandes/         # Gestion commandes
│   │   ├── clients/           # Gestion clients
│   │   ├── homepage/          # Page builder
│   │   └── settings/          # Paramètres site
│   ├── api/
│   │   ├── checkout/stripe/   # Création session Stripe
│   │   ├── checkout/paypal/   # Création commande PayPal
│   │   ├── webhooks/stripe/   # Webhook confirmation paiement
│   │   ├── promo/validate/    # Validation codes promo
│   │   └── newsletter/        # Inscription newsletter
│   ├── sitemap.ts
│   └── robots.ts
├── components/
│   ├── layout/
│   │   ├── Header.tsx         # Header noir, logo centré, menu mobile
│   │   └── Footer.tsx         # Footer blanc style BHP
│   ├── home/
│   │   ├── HeroSection.tsx    # Hero plein écran NB
│   │   ├── DecouvrezSection.tsx # Tabs + carousel produits
│   │   └── HomeComponents.tsx # Toutes les autres sections home
│   ├── product/
│   │   ├── ProductCard.tsx    # Carte produit avec bouton +
│   │   ├── CollectionPageClient.tsx # Grille collection
│   │   └── ProductPageClient.tsx    # Fiche produit complète
│   ├── cart/
│   │   └── CartDrawer.tsx     # Drawer panier Shopify-like
│   ├── checkout/
│   │   └── CheckoutPage.tsx   # Page checkout Stripe + PayPal
│   ├── account/
│   │   ├── AuthPage.tsx       # Connexion / Inscription
│   │   └── AccountPage.tsx    # Dashboard client + VIP
│   ├── admin/
│   │   └── ProductForm.tsx    # CRUD produit complet
│   └── ui/
│       └── Ticker.tsx         # Texte défilant
├── hooks/
│   └── useCarousel.ts         # Hook swipe/drag carousel
├── lib/
│   └── supabase.ts            # Client Supabase
├── store/
│   └── cart.ts                # Zustand store panier
└── types/
    └── index.ts               # Types TypeScript complets
```

---

## Déploiement Vercel

```bash
# Installer Vercel CLI
npm i -g vercel

# Déployer
vercel --prod

# Configurer les variables d'environnement dans Vercel Dashboard
# Ajouter le webhook Stripe : https://kbhair.fr/api/webhooks/stripe
```

---

## Admin Panel

Accessible sur `/admin`  
Protection : ajouter middleware d'authentification admin

---

## Multilingue

- `/fr/*` — Français complet
- `/en/*` — Anglais complet
- Tout le contenu gérable depuis l'admin (textes, SEO, etc.)

---

## Fonctionnalités complètes

✅ Homepage fidèle Bright Hair Paris  
✅ Header noir, menu mobile, carousel swipeable  
✅ Page collection grille 2 colonnes  
✅ Fiche produit avec galerie, variantes, FAQ, produits associés  
✅ CartDrawer Shopify-like  
✅ Checkout Stripe + PayPal  
✅ Webhook Stripe confirmation  
✅ Espace client + commandes + VIP Bronze/Silver/Gold  
✅ Admin panel : produits, commandes, clients  
✅ Codes promo avec validation  
✅ Newsletter  
✅ SEO : sitemap.xml, robots.txt, meta dynamiques  
✅ Multilingue FR/EN  
✅ RLS Supabase  
✅ TypeScript strict  
