<objective>
Créer un site e-commerce complet pour **Beaucharme Cosmétique**, une marque de cosmétiques naturels créée par deux agriculteurs bourguignons près de Vézelay.

Le site doit incarner l'ADN de la marque : **authenticité paysanne + exigence cosmétique**, avec un design **moderne et innovant** qui respire l'authenticité et le naturel — pas un site "bio classique", mais quelque chose de frais, élégant, luxe discret.

**Stack technique** : Astro + Tailwind CSS
**Approche** : Desktop-first avec adaptation mobile soignée
**E-commerce** : Mock UI (pas de backend de paiement réel, mais UI complète)
</objective>

<brand_identity>
**Marque** : Beaucharme Cosmétique
**Slogan** : "Faire le pont entre la tradition et la modernité"
**Promesse** : De la graine au flacon — traçabilité totale

**Points différenciants à mettre en valeur** :
- Intégration verticale totale : culture des plantes → fabrication → flacon
- Plantes rares cultivées en France : bourrache, carthame, onagre
- Zéro eau dans les crèmes mains (innovation formulatoire)
- Alambic sur place pour la distillation
- Packaging éco-conçu : verre, PE végétal, mono-matériau
- 75% minimum d'ingrédients de la ferme dans chaque produit
- Certification COSMOS, pratiques bio

**Ton éditorial** : Chaleureux, simple, authentique. Les fondateurs parlent en "nous". Pas de promesses marketing exagérées, juste la vérité du produit.
</brand_identity>

<design_direction>
**Mots-clés visuels** :
- Terroir contemporain
- Luxe discret
- Artisanat raffiné
- Nature brute mais design
- Slow beauty

**Inspirations** :
- Aesop (minimalisme élégant)
- Le Labo (authenticité brute)
- Typology (clarté moderne)
- Avec une âme plus terrienne, "les mains dans la terre"

**Palette couleurs suggérée** (adapter librement) :
- Tons naturels et chauds
- Beige / crème
- Terracotta
- Vert sauge
- Blanc cassé
- Touches dorées

**Typographie** : Choisir des polices qui évoquent à la fois l'artisanat (serif élégant pour les titres) et la modernité (sans-serif épuré pour le corps).

**Animations** : Subtiles — hovers doux, transitions CSS fluides, scroll reveal léger. Pas de parallax complexe ni d'animations lourdes.
</design_direction>

<site_structure>
Créer 4 pages principales :

1. **Accueil** (`/`)
   - Hero section impactant avec promesse de marque
   - Section "De la graine au flacon" (storytelling visuel)
   - Produits phares (3-4 produits mis en avant)
   - Section engagement/valeurs
   - Newsletter signup
   - Footer complet

2. **Notre Histoire** (`/notre-histoire`)
   - Les fondateurs (photos, parcours)
   - La ferme près de Vézelay
   - Le processus de fabrication (timeline ou storytelling visuel)
   - L'alambic et la distillation
   - Les certifications et engagements

3. **Boutique** (`/boutique`)
   - Filtrage par catégorie
   - Grille de produits avec hover effects
   - Modal ou page produit avec détails
   - Indicateur de stock (certains produits en rupture)
   - Bouton "Ajouter au panier" (mock)

4. **Contact** (`/contact`)
   - Formulaire de contact (mock, sans backend)
   - Localisation (près de Vézelay, Bourgogne)
   - Réseaux sociaux / Instagram
   - Horaires de visite de la ferme (si applicable)

**Navigation** : Header sticky avec logo, liens de navigation, icône panier avec compteur

**Panier** : Sidebar ou modal panier (mock UI complète)
</site_structure>

<products_catalog>
Intégrer tous ces produits avec leurs catégories et prix :

**Coffrets** (18€ à 65€)
- Coffret Découverte - 18€
- Coffret Cocooning Corps - 45€
- Coffret Bien-être Absolu - 65€
- Coffret Routine Visage - 42€
- Coffret L'Indispensable - 35€
- Coffret Le Naturel - 38€
- Coffret Le Complet - 58€

**Huiles végétales** (~15-28€)
- Huile de Chanvre - 18€
- Huile de Tournesol - 15€
- Huile de Cameline - 22€
- Huile de Carthame - 24€
- Huile de Bourrache - 28€

**Huiles de soin corps** (~28-39€)
- Huile de soin Luxe - 39€
- Huile de soin Volupté - 35€
- Huile de soin Apaisante - 28€

**Crèmes mains** (13,80€) — *Mention : sans eau, tubes végétaux*
- Crème mains Sublime - 13,80€
- Crème mains Radieuse - 13,80€
- Crème mains Délicate - 13,80€
- Crème mains Soyeuse - 13,80€

**Savons surgras** (~7€) — *Mention : avec cire d'abeille locale*
- Savon Éclat - 7€
- Savon Délicat - 7€
- Savon Doux - 7€
- Savon Pur - 7€

**Eaux florales / Hydrolats** (~7-11€)
- Eau florale de Lavande - 9€
- Eau florale de Rose - 11€
- Hydrolat de Menthe - 7€
- Hydrolat de Camomille - 8€

Pour chaque produit, générer une description courte et authentique en cohérence avec le ton de la marque.
</products_catalog>

<assets_instructions>
**Images à récupérer** : Télécharger les images depuis le site actuel https://www.beaucharme-cosmetique.com/

Utiliser WebFetch pour explorer le site et identifier les URLs des images de :
- Produits (toutes les catégories)
- Fondateurs / équipe
- Ferme et paysages
- Processus de fabrication (alambic, plantes, etc.)
- Logo

Sauvegarder les images dans `./public/images/` avec une structure organisée :
```
./public/images/
├── logo/
├── products/
│   ├── coffrets/
│   ├── huiles-vegetales/
│   ├── huiles-soin/
│   ├── cremes-mains/
│   ├── savons/
│   └── eaux-florales/
├── farm/
├── founders/
└── process/
```

Si certaines images ne sont pas disponibles, utiliser des placeholders de Unsplash avec des mots-clés appropriés (lavande, cosmétiques naturels, ferme française, etc.).
</assets_instructions>

<technical_requirements>
**Structure du projet Astro** :
```
./
├── src/
│   ├── components/
│   │   ├── Header.astro
│   │   ├── Footer.astro
│   │   ├── ProductCard.astro
│   │   ├── CartSidebar.astro
│   │   ├── Newsletter.astro
│   │   └── ...
│   ├── layouts/
│   │   └── Layout.astro
│   ├── pages/
│   │   ├── index.astro
│   │   ├── notre-histoire.astro
│   │   ├── boutique.astro
│   │   └── contact.astro
│   ├── data/
│   │   └── products.json
│   └── styles/
│       └── global.css
├── public/
│   └── images/
├── tailwind.config.mjs
├── astro.config.mjs
└── package.json
```

**Tailwind** :
- Configurer les couleurs de la marque dans `tailwind.config.mjs`
- Utiliser les classes utilitaires de manière cohérente
- Créer des composants réutilisables

**Responsive** :
- Desktop-first avec breakpoints Tailwind standards
- Mobile : menu hamburger, grille produits adaptée, formulaire optimisé

**Animations CSS** :
- Transitions douces sur les hovers (300ms ease)
- Fade-in au scroll avec `@keyframes` ou classes utilitaires
- Pas de dépendances externes (pas de GSAP)

**SEO** :
- Balises meta appropriées en français
- Attributs alt sur toutes les images
- Structure HTML sémantique
</technical_requirements>

<e-commerce_ui>
Créer une UI e-commerce complète (mock, sans backend) :

**Panier** :
- État géré en JavaScript vanilla (localStorage)
- Compteur dans le header
- Sidebar panier avec :
  - Liste des produits ajoutés
  - Quantités modifiables
  - Suppression de produits
  - Sous-total et total
  - Bouton "Passer commande" (mock alert)

**Page produit / Modal** :
- Grande image produit
- Nom, prix, description
- Ingrédients principaux
- Bouton ajouter au panier
- Produits suggérés

**Boutique** :
- Filtres par catégorie (tabs ou sidebar)
- Grille responsive
- Hover effect sur les cartes produit
- Badge "Rupture de stock" sur certains produits (marquer 2-3 produits comme indisponibles)
</e-commerce_ui>

<content_guidelines>
**Langue** : Tout le contenu en français

**Accueil - Hero** :
- Headline impactant évoquant "de la graine au flacon"
- Sous-titre sur l'authenticité et le terroir bourguignon
- CTA vers la boutique

**Accueil - Valeurs** :
- Bloc sur la traçabilité
- Bloc sur les ingrédients locaux (75% min de la ferme)
- Bloc sur l'éco-conception

**Notre Histoire** :
- Présentation chaleureuse des fondateurs (agriculteurs passionnés)
- L'histoire de la ferme près de Vézelay
- Le choix des plantes rares (bourrache, carthame, onagre)
- Le processus artisanal (de la culture à la distillation)

**Produits** :
- Descriptions courtes, authentiques
- Mettre en avant les particularités (ex: "Sans eau ajoutée" pour les crèmes mains)
- Ingrédients clés de la ferme

**Newsletter** :
- Accroche douce : "Restez connectés à la terre"
- Promesse : actualités de la ferme, nouveautés, conseils
</content_guidelines>

<verification>
Avant de considérer le travail comme terminé, vérifier :

1. **Structure** : Les 4 pages sont créées et navigables
2. **Design** : Cohérence visuelle, palette respectée, typographie harmonieuse
3. **Responsive** : Test sur desktop ET mobile (menu, grilles, formulaires)
4. **Produits** : Tous les produits du catalogue sont présents avec les bons prix
5. **Panier** : Fonctionnel (ajout, modification, suppression, persistance localStorage)
6. **Images** : Toutes les images sont en place ou ont des placeholders appropriés
7. **Contenu** : Textes en français, ton authentique respecté
8. **Performance** : Pas d'animations lourdes, images optimisées
9. **Build** : `npm run build` fonctionne sans erreur
</verification>

<output>
Créer tous les fichiers du projet Astro avec la structure indiquée.

Fichiers principaux à créer :
- `./package.json`
- `./astro.config.mjs`
- `./tailwind.config.mjs`
- `./src/layouts/Layout.astro`
- `./src/pages/index.astro`
- `./src/pages/notre-histoire.astro`
- `./src/pages/boutique.astro`
- `./src/pages/contact.astro`
- `./src/components/*.astro` (tous les composants nécessaires)
- `./src/data/products.json`
- `./src/styles/global.css`
- `./public/images/*` (images téléchargées ou placeholders)

Après création, fournir les instructions pour lancer le projet :
```bash
npm install
npm run dev
```
</output>

<success_criteria>
- Site visuellement impressionnant, moderne et authentique
- Navigation fluide entre les 4 pages
- Boutique fonctionnelle avec tous les produits
- Panier mock opérationnel
- Design cohérent avec l'identité Beaucharme
- Responsive desktop → mobile
- Code propre et maintenable
- Prêt à être présenté comme maquette client
</success_criteria>
