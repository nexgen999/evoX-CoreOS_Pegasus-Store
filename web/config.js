/**
 * Configuration du Store evoX CoreOS - Pegasus Store
 * Ce fichier peut être modifié directement sans avoir besoin de recompiler l'application.
 */
window.EVOX_CONFIG = {
  // 1. Avatar / Logo GitHub
  // Indiquez votre pseudo GitHub (ex: 'nexgen999')
  // Si laissé sur 'auto' ou vide, détecte automatiquement le compte depuis 'pseudo.github.io' !
  githubUsername: 'nexgen999',

  // Ou une URL directe d'image personnalisée pour le logo (laisser vide pour utiliser l'avatar GitHub) :
  customLogoUrl: '',

  // 2. Nom de marque
  brandName: 'evoX CoreOS',
  brandSub: 'Pegasus Store',

  // 3. Réseaux sociaux & Liens dans le pied de page (Footer)
  // Vous pouvez renseigner :
  // - Une classe Font Awesome gratuite : 'fa-brands fa-github', 'fa-brands fa-discord', 'fa-brands fa-x-twitter', 'fa-brands fa-youtube', 'fa-brands fa-telegram', 'fa-solid fa-globe', etc.
  // - Ou l'URL directe d'une image d'icône (ex: 'https://.../mon-icone.png')
  socialLinks: [
    {
      name: 'GitHub',
      url: 'https://github.com/nexgen999/evoX-CoreOS',
      icon: 'fa-brands fa-github'
    },
    {
      name: 'Discord',
      url: 'https://discord.gg/',
      icon: 'fa-brands fa-discord'
    },
    {
      name: 'X / Twitter',
      url: 'https://x.com/',
      icon: 'fa-brands fa-x-twitter'
    },
    {
      name: 'YouTube',
      url: 'https://youtube.com/',
      icon: 'fa-brands fa-youtube'
    }
  ],

  // 4. Texte personnalisé affiché à droite dans le pied de page
  footerRightText: 'evoX CoreOS Hub • Tous droits réservés',
  footerRightLink: 'https://github.com/nexgen999/evoX-CoreOS', // Optionnel : lien cliquable pour ce texte

  // Afficher ou non le bouton Studio RAWG dans le footer (false par défaut pour la page publique)
  // Astuce : vous pouvez toujours ouvrir le studio en ajoutant ?studio=1 à l'URL de votre navigateur !
  showStudioInFooter: false
};
