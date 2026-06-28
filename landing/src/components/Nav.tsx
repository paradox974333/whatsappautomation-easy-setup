import { REPO_URL } from '../data';
import WhatsAppLogo from './WhatsAppLogo';

const LINKS = [
  { label: 'Overview', href: '#overview' },
  { label: 'Features', href: '#features' },
  { label: 'Setup', href: '#setup' },
];

export default function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b border-silver-mist bg-fog/80 backdrop-blur-xl">
      <nav className="mx-auto flex h-12 max-w-[1200px] items-center justify-between px-5 sm:px-6">
        <a href="#overview" className="flex items-center gap-2">
          <WhatsAppLogo size={24} />
          <span className="text-[14px] font-semibold tracking-[-0.006em] text-ink">
            WhatsApp&nbsp;AI
          </span>
        </a>

        <div className="hidden items-center gap-7 md:flex">
          {LINKS.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="text-[12px] tracking-[-0.003em] text-ink transition-colors duration-100 hover:text-graphite"
            >
              {l.label}
            </a>
          ))}
        </div>

        <a
          href={REPO_URL}
          target="_blank"
          rel="noreferrer"
          className="rounded-full bg-azure px-4 py-[6px] text-[13px] font-medium text-snow transition-opacity duration-100 hover:opacity-90 sm:text-[14px]"
        >
          Get it on GitHub
        </a>
      </nav>
    </header>
  );
}
