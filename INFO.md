# 📖 Guide de Configuration & Déploiement - evoX Pegasus Store

Ce guide détaille pas-à-pas toutes les étapes pour configurer et déployer votre store sur **GitHub Pages**, personnaliser le site via `/web/config.js`, et ajuster la fréquence de mise à jour automatique.

---

## 1. 📁 Fichiers à envoyer sur votre dépôt GitHub

Lorsque vous déposez votre projet sur GitHub (via GitHub Desktop, VS Code ou en ligne de commande), envoyez l'arborescence suivante :

### ✅ Fichiers OBLIGATOIRES à inclure :
- `.github/workflows/deploy.yml` *(Le bot qui automatise la compilation et la mise en ligne)*
- `scripts/build-catalog.js` *(Le script qui télécharge vos catalogues JSON et interroge RAWG.io)*
- `web/config.js` *(Votre fichier de personnalisation pour le logo, les réseaux et le footer)*
- `public/` *(Contient `web/config.js` et la base `catalog_database.json`)*
- `src/` *(Tout le code source de l'interface React / TypeScript)*
- `index.html` *(Le fichier HTML d'entrée du site)*
- `package.json` & `package-lock.json` *(La liste des bibliothèques nécessaires)*
- `tsconfig.json` & `vite.config.ts` *(Les fichiers de compilation)*
- `README.md` & `INFO.md` *(La documentation)*

### ❌ Fichiers à NE PAS envoyer (laisser le .gitignore faire) :
- `node_modules/` *(Très lourd, GitHub l'installera automatiquement en quelques secondes)*
- `dist/` *(C'est le robot GitHub Actions qui le génère et le déploie automatiquement)*

---

## 2. 🔑 Étape 1 : Ajouter votre Clé API RAWG sur GitHub

Pour que le bot puisse enrichir vos jeux avec les jaquettes officielles haute définition, les développeurs, éditeurs et notes :

1. Rendez-vous sur votre dépôt GitHub dans votre navigateur.
2. Cliquez sur l'onglet **Settings** (Paramètres) tout en haut à droite.
3. Dans le menu de gauche, descendez jusqu'à **Secrets and variables**, puis cliquez sur **Actions**.
4. Cliquez sur le bouton vert **New repository secret**.
5. Remplissez exactement comme ceci :
   - **Name** : `RAWG_API_KEY`
   - **Secret** : *Collez ici votre clé API RAWG* (ex: `8a7c6b54d3e210...`)
6. Cliquez sur **Add secret**.

> 💡 *Note : Si vous n'avez pas encore de clé, vous pouvez en obtenir une gratuitement en 1 minute sur [rawg.io/apidocs](https://rawg.io/apidocs).*

---

## 3. 🚀 Étape 2 : Activer GitHub Pages

1. Toujours dans **Settings** sur votre dépôt GitHub.
2. Dans le menu de gauche, cliquez sur **Pages**.
3. Sous la section **Build and deployment** :
   - Cliquez sur le menu déroulant **Source**.
   - Sélectionnez : **GitHub Actions**.
4. C'est tout ! Aucun autre réglage n'est requis.

---

## 4. ⏰ Guide des Tâches CRON (Planification Automatique)

Le fichier `.github/workflows/deploy.yml` est actuellement configuré pour tourner **automatiquement toutes les 6 heures**.

Si vous souhaitez changer cette fréquence à l'avenir, ouvrez `.github/workflows/deploy.yml` et modifiez simplement la ligne `cron :` selon vos besoins :

| Fréquence souhaitée | Ligne exacte à mettre dans `deploy.yml` | Description |
| :--- | :--- | :--- |
| **Toutes les 3 heures** | `- cron: '0 */3 * * *'` | Se met à jour 8 fois par jour |
| **Toutes les 6 heures** *(actuel)* | `- cron: '0 */6 * * *'` | Se met à jour 4 fois par jour (recommandé) |
| **Toutes les 12 heures** | `- cron: '0 */12 * * *'` | Se met à jour 2 fois par jour (matin et soir) |
| **Une fois par jour (à minuit)** | `- cron: '0 0 * * *'` | Se met à jour chaque nuit à 00:00 UTC |
| **Une fois par jour à 04h00 du matin** | `- cron: '0 4 * * *'` | Se met à jour chaque matin à 04:00 UTC |

### Comment tester le bot manuellement sans attendre le cron ?
Dans votre dépôt GitHub, allez dans l'onglet **Actions** ➔ cliquez sur **Build and Deploy evoX Pegasus Store to GitHub Pages** à gauche ➔ cliquez sur **Run workflow** ➔ **Run workflow**.

---

## 5. 🎨 Personnaliser `/web/config.js` (Avatar, Réseaux, Footer)

Le fichier `/web/config.js` vous permet de modifier l'apparence du site sans devoir recompiler l'application. Voici les détails de chaque option :

### A. Avatar / Logo GitHub
```javascript
// Votre pseudo GitHub :
githubUsername: 'nexgen999',
```
- Le site affichera automatiquement l'avatar HD de ce compte GitHub (`https://github.com/nexgen999.png`).
- Si quelqu'un d'autre forke votre dépôt et l'héberge sur `sonpseudo.github.io`, le site détectera automatiquement son pseudo !
- Si vous préférez afficher un logo image spécifique au lieu de l'avatar GitHub :
  ```javascript
  customLogoUrl: 'https://monsite.com/mon-logo.png',
  ```

### B. Réseaux Sociaux dans le Pied de Page (Footer)
Vous pouvez ajouter ou modifier n'importe quel réseau dans la liste `socialLinks` :
```javascript
socialLinks: [
  {
    name: 'GitHub',
    url: 'https://github.com/nexgen999/evoX-CoreOS',
    icon: 'fa-brands fa-github' // Classe Font Awesome
  },
  {
    name: 'Discord',
    url: 'https://discord.gg/votre-serveur',
    icon: 'fa-brands fa-discord'
  },
  {
    name: 'X / Twitter',
    url: 'https://x.com/votre-compte',
    icon: 'fa-brands fa-x-twitter'
  },
  {
    name: 'YouTube',
    url: 'https://youtube.com/@votre-chaine',
    icon: 'fa-brands fa-youtube'
  },
  {
    name: 'Telegram',
    url: 'https://t.me/votre-canal',
    icon: 'fa-brands fa-telegram'
  },
  {
    name: 'Site Web',
    url: 'https://monsite.com',
    icon: 'fa-solid fa-globe'
  }
]
```
> 💡 *Astuce : Pour les icônes, vous pouvez mettre n'importe quelle classe Font Awesome gratuite (`fa-brands ...` ou `fa-solid ...`) OU directement une URL d'image (`https://.../icone.png`).*

### C. Texte à droite dans le Footer
```javascript
// Le texte affiché :
footerRightText: 'evoX CoreOS Hub • Tous droits réservés',

// Si vous voulez que ce texte soit un lien cliquable :
footerRightLink: 'https://github.com/nexgen999/evoX-CoreOS',
```

### D. Accès au Studio RAWG
Par défaut, pour garder votre site public GitHub propre comme sur votre photo, le bouton Studio est masqué (`showStudioInFooter: false`).

Si vous voulez ouvrir le Studio RAWG et le convertisseur depuis votre navigateur :
- Soit ajoutez simplement `?studio=1` à la fin de l'adresse du site dans votre navigateur :  
  `https://nexgen999.github.io/mon-store/?studio=1`
- Soit passez `showStudioInFooter: true` dans `/web/config.js`.

---

## 6. 🛠️ Comment ajouter un nouveau catalogue de jeux ?

Pour ajouter un nouveau catalogue JSON (par exemple un nouveau miroir ou une nouvelle liste de jeux) :
1. Ouvrez `scripts/build-catalog.js`.
2. Dans la liste `const SOURCES = [ ... ]`, ajoutez simplement votre nouvelle source :
   ```javascript
   {
     id: 'mon-catalogue',
     name: 'Mon Catalogue Repack',
     isGameCatalog: true, // true pour un catalogue de jeux (scan RAWG), false pour homebrew
     urls: [
       'https://mon-lien.com/catalog.json'
     ]
   }
   ```
3. Poussez la modification sur GitHub : le bot s'occupera automatiquement du reste lors du prochain déploiement !

---

## 7. ⚡ Fonctionnement du Scrap RAWG & Système de Cache

### Est-ce que le bot va rescrapper tous les jeux à chaque fois ?
**NON ! Le script intègre un système de cache incrémental intelligent :**
1. **La toute première fois (Initialisation)** :
   Le cache est vide au départ. Le bot doit interroger RAWG pour chaque jeu (plusieurs centaines de jeux). Avec la politesse de l'API (délai de 220ms pour respecter les quotas de RAWG et ne pas se faire bloquer en erreur HTTP 429), ce premier scan initial prend entre 8 et 15 minutes. C'est tout à fait normal.
2. **Toutes les fois suivantes (Tâches planifiées toutes les 6h ou lancements manuels)** :
   - Le workflow GitHub Actions restaure automatiquement le cache (`actions/cache@v4`).
   - Tout jeu déjà traité ou déjà enrichi est réutilisé en **0 milliseconde** (instantané sans appel réseau).
   - Le script interroge RAWG **UNIQUEMENT** pour les **nouveaux jeux ajoutés** dans vos fichiers JSON depuis le dernier passage !
   - Le build ne prendra plus alors que **30 à 60 secondes** au lieu de 15 minutes.
3. **Sécurité en cas d'interruption** :
   Le cache est sauvegardé progressivement sur le disque tous les 20 jeux. Si un job est annulé ou interrompu, rien n'est perdu : la prochaine exécution reprendra exactement là où elle s'est arrêtée !

