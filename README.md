# evoX CoreOS - Pegasus Store 🎮

[![GitHub Pages](https://img.shields.io/badge/Deploy-GitHub_Pages-22c55e?style=flat&logo=github)](https://pages.github.com/)
[![React](https://img.shields.io/badge/React-19-61dafb?style=flat&logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-646cff?style=flat&logo=vite)](https://vitejs.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4-38bdf8?style=flat&logo=tailwindcss)](https://tailwindcss.com/)
[![RAWG API](https://img.shields.io/badge/Metadata-RAWG.io-ff0055?style=flat)](https://rawg.io/apidocs)

Un store de jeux moderne, rapide et élégant pour consoles (PS5/PS4/PC/Mobile), inspiré des interfaces d'accueil Pegasus Frontend et PlayStation 5. L'application unifie automatiquement vos multiples catalogues distants (*BlackBox, Pippo, PFS, DLPS, evoX APPS, Homebrew Store*) en une seule base de données normalisée, enrichit les métadonnées via l'API **RAWG.io** et se déploie à 100% en site statique ultra-rapide sur **GitHub Pages**.

---

## ✨ Fonctionnalités Principales

- 🎯 **Design Gaming Épuré & Fluide** :
  - Thème sombre *evoX* avec accents néon écarlates et cyan.
  - Bannière **À la une (Hero)** dynamique avec fondu d'ambiance et accès direct aux fiches.
  - **Carrousels horizontaux à défilement fluide** pour chaque source de catalogue.
  - **4 modes d'affichage interchangeables** : Jaquettes (Grille), Bannières (Cartes), Liste compacte et Tableau technique.
  - **Mode Page complète OU Pop-up Modal** commutable directement depuis l'en-tête.

- 🤖 **Normalisation & Automatisation de Catalogues** :
  - Script Node.js autonome (`scripts/build-catalog.js`) qui télécharge et fusionne automatiquement tous vos JSONs.
  - Classification intelligente des paquets : **Base Game**, **Mise à jour / Patch**, **DLC / Extension**, **Backport** et **Homebrew**.
  - Détection automatique des tailles, des versions et des Title IDs (`PPSA` / `CUSA`).

- 🌟 **Enrichissement des Métadonnées via RAWG.io** :
  - Jaquettes officielles haute résolution et fonds d'écran grand format.
  - Noms des **Développeurs** et **Éditeurs** (*ex: FromSoftware, Santa Monica Studio*).
  - **Durée de jeu moyenne estimée** (*ex: ~45 heures*).
  - **Classification d'âge / ESRB** (*Mature 17+, Teen*).
  - **Score Metacritic** avec lien direct vers la fiche de test.
  - **Liens officiels** : Site web officiel du jeu, Subreddit communautaire, Trailers 4K YouTube, fiche PlayStation Store officielle et base Prospero Patches.
  - **Galerie de captures d'écran in-game** avec visionneuse lightbox plein écran.
  - *Filtrage intelligent : Les applications Homebrew sont automatiquement protégées et ignorées par le scan RAWG.*

- 📦 **Mises à Jour Récentes & Téléchargements** :
  - Onglet dédié répertoriant les derniers patchs, DLCs et backports.
  - Boutons de téléchargement directs et bouton **« Copier tout pour JDownloader »** en un clic.

- 🔍 **Recherche Globale Instantanée** :
  - Fenêtre de recherche accessible via <kbd>Ctrl</kbd> + <kbd>K</kbd> (ou <kbd>⌘K</kbd>) pour chercher par nom, PPSA/CUSA ou mot-clé.

- 👤 **Logo Avatar GitHub Universel & Réseaux Sociaux** :
  - L'icône de logo charge automatiquement l'avatar HD de votre compte GitHub (`https://github.com/votre-pseudo.png`).
  - Détection automatique si vous ou quelqu'un d'autre forke le projet sur son propre GitHub Pages (`pseudo.github.io`).
  - Pied de page personnalisable avec vos réseaux sociaux (*Font Awesome ou images*) et vos crédits configurables dans `/web/config.js`.

- 🚀 **Déploiement 100% Automatique GitHub Actions** :
  - Workflow GitHub Actions prêt à l'emploi (`.github/workflows/deploy.yml`) exécuté à chaque push et programmé automatiquement pour garder votre catalogue à jour.

---

## 📁 Structure du Projet

```text
├── .github/
│   └── workflows/
│       └── deploy.yml          # Workflow automatique GitHub Actions
├── scripts/
│   └── build-catalog.js        # Script de téléchargement des JSONs et enrichissement RAWG
├── web/
│   └── config.js               # Configuration du logo GitHub, réseaux sociaux et footer
├── public/
│   ├── web/config.js           # Copie servie par Vite au runtime
│   └── catalog_database.json   # Base de données finale unifiée générée par le script
├── src/
│   ├── components/             # Composants React (Header, Hero, Carrousels, Fiches, Modal)
│   ├── data/                   # Sources de catalogues par défaut et données de secours
│   ├── services/               # Client API RAWG.io et synchronisation
│   ├── types/                  # Définitions TypeScript complètes
│   ├── utils/                  # Normaliseur universel de JSONs et utilitaires de configuration
│   ├── App.tsx                 # Composant racine
│   └── main.tsx                # Point d'entrée React 19
├── index.html                  # Fichier HTML d'accueil
├── package.json                # Dépendances et scripts npm
├── vite.config.ts              # Configuration Vite
├── INFO.md                     # Guide de configuration pas-à-pas pour GitHub
└── README.md                   # Ce fichier
```

---

## 🛠️ Installation & Démarrage en Local

### Prérequis
- [Node.js](https://nodejs.org/) v18 ou v20+
- Un compte [RAWG.io](https://rawg.io/apidocs) gratuit pour obtenir votre clé API (optionnel mais recommandé).

### 1. Cloner le projet et installer les dépendances
```bash
git clone https://github.com/nexgen999/evoX-CoreOS.git
cd evoX-CoreOS
npm install
```

### 2. Lancer le serveur de développement local
```bash
npm run dev
```
Ouvrez votre navigateur sur `http://localhost:3000`.

### 3. Exécuter le script de normalisation & RAWG localement (optionnel)
```bash
# Sans clé RAWG (normalisation rapide des JSONs) :
npm run build:catalog

# Avec votre clé RAWG (enrichissement complet) :
RAWG_API_KEY="votre_cle_ici" npm run build:catalog
```

---

## 🚀 Déploiement sur GitHub Pages

Pour déployer votre site sur GitHub en 2 minutes sans taper de ligne de commande :
👉 **Consultez le guide complet détaillé dans [INFO.md](./INFO.md)**.

En résumé :
1. Envoyez vos fichiers sur GitHub.
2. Ajoutez votre secret `RAWG_API_KEY` dans **Settings > Secrets and variables > Actions**.
3. Activez GitHub Pages dans **Settings > Pages** avec la source **GitHub Actions**.
4. Le workflow s'exécute automatiquement et publie votre site sur `https://votre-pseudo.github.io/votre-depot/` !

---

## ⚙️ Personnalisation Simple (`/web/config.js`)

Vous pouvez modifier le pseudo de l'avatar, les liens de vos réseaux sociaux et le texte du pied de page en éditant simplement `/web/config.js` sans avoir à recompiler le code :

```javascript
window.EVOX_CONFIG = {
  githubUsername: 'nexgen999', // Votre pseudo GitHub pour l'avatar
  socialLinks: [
    { name: 'GitHub', url: 'https://github.com/...', icon: 'fa-brands fa-github' },
    { name: 'Discord', url: 'https://discord.gg/...', icon: 'fa-brands fa-discord' },
    { name: 'YouTube', url: 'https://youtube.com/...', icon: 'fa-brands fa-youtube' }
  ],
  footerRightText: 'evoX CoreOS Hub • Tous droits réservés'
};
```

---

## 📜 Licence

Projet distribué sous licence MIT. Libre à vous de le forker et de l'adapter à vos propres besoins !
