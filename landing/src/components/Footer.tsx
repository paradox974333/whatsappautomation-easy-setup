import { Github, Star } from 'lucide-react';
import { REPO_URL } from '../data';

export default function Footer() {
  return (
    <section className="bg-snow px-5 pb-12 pt-4 sm:px-6">
      {/* Dark Stage closing CTA — used sparingly, maximum contrast */}
      <div className="mx-auto max-w-[1200px] rounded-card bg-obsidian px-6 py-20 text-center sm:py-28">
        <h2 className="mx-auto max-w-[820px] font-display text-[clamp(32px,6vw,72px)] font-bold leading-[1.05] tracking-[-0.022em] text-snow">
          Open source. Yours to run.
        </h2>
        <p className="mx-auto mt-5 max-w-[540px] font-text text-[clamp(17px,2.2vw,20px)] font-light leading-[1.4] tracking-[-0.01em] text-[#a1a1a6]">
          Free under the MIT license. Clone it, rebrand it, deploy it — and keep
          every conversation on infrastructure you control.
        </p>
        <div className="mt-9 flex flex-col items-center justify-center gap-x-7 gap-y-4 sm:flex-row">
          <a
            href={REPO_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-azure px-6 py-3 text-[17px] font-medium text-snow transition-opacity duration-100 hover:opacity-90"
          >
            <Github size={18} />
            Get it on GitHub
          </a>
          <a
            href={REPO_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-[17px] font-medium text-snow/90 transition-opacity duration-100 hover:opacity-70"
          >
            <Star size={17} />
            Star the repo
          </a>
        </div>
      </div>

      {/* Footer line */}
      <footer className="mx-auto mt-10 flex max-w-[1200px] flex-col items-center justify-between gap-3 border-t border-silver-mist pt-8 text-[12px] tracking-[-0.003em] text-graphite sm:flex-row">
        <span>WhatsApp AI Automation — MIT licensed.</span>
        <span>
          Built with WPPConnect &amp; Cerebras Llama. Not affiliated with WhatsApp.
        </span>
      </footer>
    </section>
  );
}
