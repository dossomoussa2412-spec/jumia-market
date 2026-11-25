# 🛍️ JUMIA EXPRESS CI — Application E-Commerce Complète & Responsive

Application web e-commerce moderne, rapide et responsive conçue pour le marché ivoirien et ouest-africain (mono-vendeur type vitrine Jumia simplifiée), permettant :
1. **D'acheter des produits sans création de compte obligatoire** (checkout direct en 1 clic).
2. **De payer à la livraison** en espèces (`CASH`) ou via Mobile Money (`MOBILE_MONEY` - Wave, Orange Money, MTN Moov).
3. **De suivre l'acheminement de la commande en temps réel** via un code unique (`CMD-XXXXXX`) ou son numéro de téléphone avec un stepper visuel à 4 étapes.
4. **D'administrer la boutique** via un espace sécurisé (`/admin`) pour gérer les statuts des commandes, les stocks et ajouter de nouveaux produits.

---

## 🚀 1. Stack Technique

- **Framework Web :** [Next.js](https://nextjs.org/) (App Router) + TypeScript
- **Styles & Design :** [Tailwind CSS](https://tailwindcss.com/) (thème sombre & orange dynamique Jumia) + [Lucide React](https://lucide.dev/) pour les icônes
- **Base de Données & ORM :** PostgreSQL ([Neon](https://neon.tech/)) avec **Prisma ORM 5.22.0**
- **Devise & Formatage :** Franc CFA (`FCFA` / `XOF`), montants stockés sous forme d'entiers (`Int`) et affichage formaté avec séparateur de milliers (ex: `15 000 FCFA`).
- **Langue :** 100% en Français (interface, messages d'erreurs, notifications, données de test).

---

## 🗄️ 2. Modèle de Données (`prisma/schema.prisma`)

```prisma
enum OrderStatus {
  PENDING
  CONFIRMED
  SHIPPING
  DELIVERED
  CANCELLED
}

enum PaymentMethod {
  MOBILE_MONEY
  CASH
}

model Category {
  id        String    @id @default(cuid())
  name      String
  slug      String    @unique
  products  Product[]
  createdAt DateTime  @default(now())
}

model Product {
  id          String      @id @default(cuid())
  title       String
  description String?     @db.Text
  price       Int
  oldPrice    Int?
  stock       Int         @default(0)
  imageUrl    String?
  isActive    Boolean     @default(true)
  categoryId  String?
  category    Category?   @relation(fields: [categoryId], references: [id], onDelete: SetNull)
  orderItems  OrderItem[]
  createdAt   DateTime    @default(now())
}

model Order {
  id            String        @id @default(cuid())
  trackingCode  String        @unique // Format CMD-XXXXXX
  customerName  String
  customerPhone String
  deliveryZone  String
  addressDetail String?       @db.Text
  paymentMethod PaymentMethod @default(CASH)
  deliveryFee   Int           @default(0)
  totalAmount   Int
  status        OrderStatus   @default(PENDING)
  items         OrderItem[]
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt
}

model OrderItem {
  id        String   @id @default(cuid())
  orderId   String
  order     Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)
  productId String
  product   Product  @relation(fields: [productId], references: [id], onDelete: Restrict)
  quantity  Int
  unitPrice Int
}
```

---

## 📦 3. Structure du Projet

```text
jumia-market/
├── prisma/
│   ├── schema.prisma          # Schéma de base de données PostgreSQL
│   └── seed.ts                # Script de peuplement (4 catégories, 8 produits réalistes, 1 commande de démo)
├── src/
│   ├── app/
│   │   ├── admin/
│   │   │   ├── login/page.tsx # Écran de connexion avec mot de passe
│   │   │   ├── AdminDashboard.tsx # Onglet Commandes (statuts) & Onglet Produits (stocks/prix)
│   │   │   └── page.tsx       # Route protégée par cookie de session
│   │   ├── api/
│   │   │   ├── admin/
│   │   │   │   ├── login/route.ts
│   │   │   │   ├── logout/route.ts
│   │   │   │   ├── orders/[id]/route.ts  # PATCH statut commande
│   │   │   │   └── products/[id]/route.ts # PATCH stock/prix/statut
│   │   │   │   └── products/route.ts     # GET & POST nouveau produit
│   │   │   └── orders/
│   │   │       ├── route.ts              # POST transactionnelle (vérification stock + décrémentation)
│   │   │       └── track/route.ts        # GET recherche par code CMD-XXXXXX ou téléphone
│   │   ├── panier/
│   │   │   └── page.tsx       # Panier avec gestion des quantités, formulaire & confirmation
│   │   ├── produit/[id]/
│   │   │   ├── page.tsx       # Fiche produit détaillée (SSR)
│   │   │   └── ProductDetailClient.tsx
│   │   ├── suivi/
│   │   │   └── page.tsx       # Suivi de commande avec barre de progression (Stepper)
│   │   ├── globals.css        # Styles globaux & animations
│   │   ├── layout.tsx         # Layout racine avec CartProvider
│   │   └── page.tsx           # Page d'accueil avec bannière, filtres & recherche
│   ├── components/
│   │   ├── Banner.tsx         # Bannière dynamique Jumia promo
│   │   ├── Navbar.tsx         # En-tête avec recherche, lien suivi et badge panier
│   │   ├── OrderStepper.tsx   # Stepper visuel à 4 étapes (PENDING -> DELIVERED)
│   │   ├── ProductCard.tsx    # Carte produit avec badges réduction, stock et ajout panier
│   │   ├── ProductModal.tsx   # Modal aperçu rapide avec sélecteur de quantité
│   │   └── ShopClient.tsx     # Gestion de la recherche et des catégories côté client
│   ├── context/
│   │   └── CartContext.tsx    # Panier persistant en localStorage
│   ├── lib/
│   │   ├── auth.ts            # Vérification de session administrateur
│   │   ├── prisma.ts          # Client Prisma singleton
│   │   └── utils.ts           # Formatage FCFA, zones de livraison, générateur CMD-XXXXXX
│   └── types/
│       └── index.ts           # Types TypeScript
├── .env                       # Variables d'environnement
├── .env.example
├── next.config.mjs
├── package.json
├── postcss.config.js
├── tailwind.config.js
└── tsconfig.json
```

---

## ⚙️ 4. Installation & Démarrage

### A. Configuration de l'environnement (`.env`)
Dans le fichier `.env` à la racine :
```env
# URL de connexion PostgreSQL Neon (Pooler recommandé)
DATABASE_URL="postgresql://neondb_owner:VOTRE_MOT_DE_PASSE@ep-sample-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require"

# Mot de passe administrateur pour /admin
ADMIN_PASSWORD="admin1234"

# URL publique de l'application
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### B. Commandes pour initialiser la base de données
1. **Synchroniser le schéma avec Neon PostgreSQL :**
   ```bash
   npx prisma db push
   ```

2. **Peupler la base de données avec les données initiales :**
   ```bash
   npm run prisma:seed
   ```
   *Ce script insère automatiquement 4 catégories (Téléphones & Tablettes, Électronique & Audio, Mode & Chaussures, Maison & Électroménager), 8 produits réalistes avec prix en FCFA et images Unsplash, ainsi qu'une commande de démonstration avec le code `CMD-482910`.*

3. **Lancer le serveur de développement :**
   ```bash
   npm run dev
   ```
   Rendez-vous sur [http://localhost:3000](http://localhost:3000).

---

## 🎯 5. Parcours & Fonctionnalités Clés

### 1. Boutique & Produits (`/`)
- Filtres instantanés par catégories en un clic ("Toutes les catégories", "Téléphones & Tablettes", "Électronique & Audio", etc.).
- Recherche en temps réel par mot-clé (dans le titre ou la description).
- Badges dynamiques de réduction (ex: `-14%`) calculés automatiquement à partir de `oldPrice`.
- Indicateurs de disponibilité (`En stock` / `Rupture de stock` désactivant le bouton d'ajout).
- Aperçu rapide via modal ou page dédiée (`/produit/[id]`).

### 2. Panier & Validation Sans Compte (`/panier`)
- Persistance automatique du panier dans le `localStorage` du navigateur.
- Modification des quantités et suppression instantanée.
- Zones de livraison d'Abidjan et de l'intérieur avec calcul automatique des frais :
  - Cocody : `1 500 FCFA`
  - Plateau : `1 500 FCFA`
  - Marcory / Treichville / Koumassi : `1 500 FCFA`
  - Yopougon / Abobo : `2 000 FCFA`
  - Intérieur du pays : `3 500 FCFA`
- Choix du mode de paiement :
  - **Espèces (Cash)** à la livraison.
  - **Mobile Money** (Wave, Orange Money, MTN Moov).
- Décrémentation atomique des stocks dans une transaction `prisma.$transaction`.
- Écran de succès avec code copiable en 1 clic et lien direct vers le suivi.

### 3. Suivi de Commande en Direct (`/suivi`)
- Recherche par code unique (`CMD-XXXXXX`) ou par numéro de téléphone du client.
- Stepper visuel à 4 étapes :
  1. `PENDING` : Commande reçue (En attente de validation)
  2. `CONFIRMED` : Confirmée (Préparée en entrepôt)
  3. `SHIPPING` : En cours de livraison (Colis confié au coursier)
  4. `DELIVERED` : Livrée (Remise au client)
  *(Gestion d'un affichage d'annulation rouge si `CANCELLED`)*.
- Récapitulatif détaillé des articles, frais de livraison, mode de paiement et total réglé.

### 4. Espace Administrateur (`/admin`)
- Accessible via le mot de passe défini dans `.env` (`admin1234` par défaut).
- **Onglet Commandes :**
  - Filtrage rapide par statut (`PENDING`, `CONFIRMED`, `SHIPPING`, `DELIVERED`, `CANCELLED`).
  - Contact direct du client via lien cliquable `tel:...`.
  - Changement de statut en temps réel avec sauvegarde immédiate en base.
- **Onglet Produits :**
  - Formulaire d'ajout rapide de nouveaux produits (Titre, Catégorie, Prix FCFA, Ancien Prix, Stock, Image, Description).
  - Modification en ligne du prix et du stock de chaque produit.
  - Bouton Activer / Désactiver pour masquer temporairement un article de la boutique.
