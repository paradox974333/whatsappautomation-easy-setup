import { KeyRound, QrCode, Terminal } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import QrMock from './QrMock';

type Step = {
  icon: LucideIcon;
  title: string;
  body: string;
};

const STEPS: Step[] = [
  {
    icon: Terminal,
    title: 'Clone & launch',
    body: 'Paste the one-line prompt into Claude Code, or run a single Docker command on your machine or any cloud VM.',
  },
  {
    icon: KeyRound,
    title: 'Add your key & persona',
    body: 'Drop a free Cerebras API key into .env, then describe your business in one simple text file. No code.',
  },
  {
    icon: QrCode,
    title: 'Scan once, go live',
    body: 'Open the dashboard, scan the QR with WhatsApp. It stays linked and answers customers 24/7.',
  },
];

export default function HowItWorks() {
  return (
    <section id="setup" className="bg-snow px-5 py-20 sm:px-6 sm:py-24 lg:py-32">
      <div className="mx-auto grid max-w-[1200px] grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
        {/* QR mock (left on desktop) */}
        <div className="order-2 min-w-0 animate-rise lg:order-1">
          <QrMock />
        </div>

        {/* Steps (right on desktop) */}
        <div className="order-1 min-w-0 lg:order-2">
          <h2 className="font-display text-[clamp(28px,5vw,56px)] font-bold leading-[1.07] tracking-[-0.019em] text-ink">
            Up and running in minutes.
          </h2>
          <p className="mt-5 max-w-[520px] font-text text-[clamp(17px,2.2vw,20px)] font-light leading-[1.4] tracking-[-0.01em] text-graphite">
            No second phone, no SIM, no servers to wrangle. You scan once with
            your existing number — that&apos;s it.
          </p>

          <div className="mt-9 flex flex-col gap-7">
            {STEPS.map(({ icon: Icon, title, body }, i) => (
              <div key={title} className="flex gap-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink text-[14px] font-semibold text-snow">
                  {i + 1}
                </span>
                <div>
                  <h3 className="flex items-center gap-2 font-display text-[20px] font-semibold tracking-[-0.015em] text-ink">
                    <Icon size={18} strokeWidth={1.75} />
                    {title}
                  </h3>
                  <p className="mt-1 font-text text-[16px] leading-[1.45] tracking-[-0.006em] text-graphite">
                    {body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
