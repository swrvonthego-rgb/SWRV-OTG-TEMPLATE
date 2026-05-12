import React from 'react';
import { Facebook, Twitter, Linkedin, Youtube, Instagram, Music } from 'lucide-react';
import { BRAND, FOOTER, SOCIAL } from '../site.config';
import { MEDIA } from '../media.config';

const SOCIAL_ICONS: { key: keyof typeof SOCIAL; Icon: React.FC<{ className?: string }> }[] = [
  { key: 'instagram', Icon: Instagram },
  { key: 'youtube',   Icon: Youtube },
  { key: 'facebook',  Icon: Facebook },
  { key: 'twitter',   Icon: Twitter },
  { key: 'linkedin',  Icon: Linkedin },
  { key: 'tiktok',    Icon: Music },
];

type FooterLink = { label: string; href: string; event?: string; detail?: string };

const handleFooterLink = (link: FooterLink) => (e: React.MouseEvent) => {
  if (link.event) {
    e.preventDefault();
    window.dispatchEvent(new CustomEvent(link.event, link.detail ? { detail: link.detail } : undefined));
    // Also scroll to relevant section after event fires
    const target = link.href.replace('#', '');
    if (target && target !== '/privacy' && target !== '/terms') {
      setTimeout(() => {
        document.getElementById(target)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }
  // Regular href links fall through normally
};

export const Footer: React.FC = () => {
  const activeSocials = SOCIAL_ICONS.filter(({ key }) => SOCIAL[key]);
  const ecosystemLinks = (FOOTER.ecosystemLinks as unknown) as FooterLink[];
  const resourceLinks  = (FOOTER.resourceLinks  as unknown) as FooterLink[];

  return (
    <footer className="bg-[#121212] text-white pt-24 pb-12 border-t border-gray-800">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 mb-20">

          {/* Brand block */}
          <div className="col-span-2 lg:col-span-2 pr-8">
            <img
              src={MEDIA.brand.logo}
              alt={`${BRAND.name} Logo`}
              className="h-16 w-auto object-contain mb-6"
              referrerPolicy="no-referrer"
            />
            <div className="mb-6">
              <p className="text-gray-300 tracking-[0.2em] uppercase text-[10px] md:text-xs font-bold">
                {BRAND.fullAcronym.split(' ').map((word, i, arr) => (
                  <React.Fragment key={i}>
                    <span className="text-lion-orange text-sm">{word[0]}</span>
                    {word.slice(1).toLowerCase()}
                    {i < arr.length - 1 && ' '}
                  </React.Fragment>
                ))}
              </p>
            </div>
            <p className="text-gray-400 mb-8 max-w-md leading-relaxed text-sm">
              {BRAND.description} {BRAND.tagline}.
            </p>
            {activeSocials.length > 0 && (
              <div className="flex gap-6 items-center">
                <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">Follow:</span>
                {activeSocials.map(({ key, Icon }) => (
                  <a key={key} href={SOCIAL[key]} target="_blank" rel="noopener noreferrer"
                    aria-label={key} className="text-gray-500 hover:text-lion-orange transition-colors">
                    <Icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Ecosystem links */}
          <div>
            <h5 className="font-bold mb-6 text-white uppercase text-sm tracking-wider">The Ecosystem</h5>
            <ul className="space-y-4 text-gray-500 text-sm font-medium">
              {ecosystemLinks.map((link) => (
                <li key={link.label}>
                  <a href={link.href} onClick={handleFooterLink(link)}
                    className="hover:text-lion-orange transition-colors cursor-pointer">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resource links */}
          <div>
            <h5 className="font-bold mb-6 text-white uppercase text-sm tracking-wider">Resources</h5>
            <ul className="space-y-4 text-gray-500 text-sm font-medium">
              {resourceLinks.map((link) => (
                <li key={link.label}>
                  <a href={link.href} onClick={handleFooterLink(link)}
                    className="hover:text-lion-orange transition-colors cursor-pointer">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h5 className="font-bold mb-6 text-white uppercase text-sm tracking-wider">Contact</h5>
            <a href={`mailto:${BRAND.contactEmail}`}
              className="block text-gray-500 hover:text-lion-orange text-sm font-medium transition-colors mb-3">
              {BRAND.contactEmail}
            </a>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
          <p>{FOOTER.copyright}</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            {FOOTER.legalLinks.map((link) => (
              <a key={link.label} href={link.href} className="hover:text-lion-orange transition-colors">
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};
