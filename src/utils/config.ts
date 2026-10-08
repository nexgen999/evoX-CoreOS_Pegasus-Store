export interface SocialLink {
  name: string;
  url: string;
  icon: string;
}

export interface EvoxConfig {
  githubUsername: string;
  customLogoUrl?: string;
  brandName?: string;
  brandSub?: string;
  socialLinks: SocialLink[];
  footerRightText: string;
  footerRightLink?: string;
  showStudioInFooter: boolean;
}

export function getAppConfig(): EvoxConfig {
  const globalConfig = typeof window !== 'undefined' ? (window as any).EVOX_CONFIG : null;
  const defaults: EvoxConfig = {
    githubUsername: 'nexgen999',
    customLogoUrl: '',
    brandName: 'evoX CoreOS',
    brandSub: 'Pegasus Store',
    socialLinks: [
      { name: 'GitHub', url: 'https://github.com/nexgen999/evoX-CoreOS', icon: 'fa-brands fa-github' },
      { name: 'Discord', url: 'https://discord.gg/', icon: 'fa-brands fa-discord' },
      { name: 'X / Twitter', url: 'https://x.com/', icon: 'fa-brands fa-x-twitter' },
      { name: 'YouTube', url: 'https://youtube.com/', icon: 'fa-brands fa-youtube' },
    ],
    footerRightText: 'evoX CoreOS Hub • Tous droits réservés',
    footerRightLink: 'https://github.com/nexgen999/evoX-CoreOS',
    showStudioInFooter: false,
  };

  if (!globalConfig) return defaults;

  return {
    githubUsername: globalConfig.githubUsername || defaults.githubUsername,
    customLogoUrl: globalConfig.customLogoUrl || '',
    brandName: globalConfig.brandName || defaults.brandName,
    brandSub: globalConfig.brandSub || defaults.brandSub,
    socialLinks: Array.isArray(globalConfig.socialLinks) ? globalConfig.socialLinks : defaults.socialLinks,
    footerRightText: globalConfig.footerRightText ?? defaults.footerRightText,
    footerRightLink: globalConfig.footerRightLink || '',
    showStudioInFooter: Boolean(globalConfig.showStudioInFooter),
  };
}

export function resolveAvatarUrl(config: EvoxConfig): string {
  if (config.customLogoUrl && config.customLogoUrl.trim().length > 0) {
    return config.customLogoUrl.trim();
  }

  let username = config.githubUsername?.trim();
  // Auto-detection if hosted on username.github.io
  if (!username || username === 'auto') {
    try {
      const hostname = window.location.hostname;
      if (hostname.endsWith('.github.io')) {
        username = hostname.split('.')[0];
      }
    } catch {
      // fallback
    }
  }

  if (!username) {
    username = 'nexgen999';
  }

  // GitHub user public avatar endpoint (universal, high-res, works for any GitHub user/org without API key)
  return `https://github.com/${username}.png?size=120`;
}
