import {
  CalendarCheck,
  MessagesSquare,
  Server,
  SlidersHorizontal,
  UserPlus,
  Zap,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

type Feature = {
  icon: LucideIcon;
  title: string;
  body: string;
};

const FEATURES: Feature[] = [
  {
    icon: MessagesSquare,
    title: 'Human-like replies',
    body: 'Answers customer questions naturally from your business knowledge — in any language, day or night.',
  },
  {
    icon: UserPlus,
    title: 'Automatic lead capture',
    body: 'Detects buying intent and quietly saves the contact’s name, details, and exactly what they want.',
  },
  {
    icon: CalendarCheck,
    title: 'Books meetings for you',
    body: 'Negotiates a time, confirms the slot, shares the meeting link, and alerts you instantly.',
  },
  {
    icon: SlidersHorizontal,
    title: 'Rebrand in one file',
    body: 'Make it yours by editing a single text file — no code. Works for any shop, clinic, or agency.',
  },
  {
    icon: Server,
    title: 'Self-host anywhere',
    body: 'One Docker command on any cheap VM. Your conversations and data never leave your server.',
  },
  {
    icon: Zap,
    title: 'Free AI, your choice',
    body: 'Runs on Cerebras’ generous free tier (~1M tokens/day). Swap to any model whenever you like.',
  },
];

export default function Features() {
  return (
    <section id="features" className="bg-snow px-5 py-20 sm:px-6 sm:py-24 lg:py-32">
      <div className="mx-auto max-w-[1200px]">
        <h2 className="max-w-[760px] font-display text-[clamp(28px,5vw,56px)] font-bold leading-[1.07] tracking-[-0.019em] text-ink">
          Everything a customer needs. Nothing you have to type.
        </h2>
        <p className="mt-5 max-w-[560px] font-text text-[clamp(17px,2.2vw,20px)] font-light leading-[1.4] tracking-[-0.01em] text-graphite">
          Point it at your WhatsApp number once. It handles the rest — the
          conversation, the follow-up, and the booking.
        </p>

        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:mt-16 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, body }) => (
            <div key={title} className="rounded-card bg-fog p-7">
              <Icon size={24} strokeWidth={1.75} className="text-ink" />
              <h3 className="mt-5 font-display text-[24px] font-semibold leading-[1.2] tracking-[-0.015em] text-ink">
                {title}
              </h3>
              <p className="mt-2 font-text text-[17px] leading-[1.47] tracking-[-0.006em] text-graphite">
                {body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
