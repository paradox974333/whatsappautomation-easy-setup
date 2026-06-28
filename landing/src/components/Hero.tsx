import { ArrowRight } from 'lucide-react';
import { REPO_URL } from '../data';
import CopyCommand from './CopyCommand';
import PhoneFrame from './PhoneFrame';
import ChatScreen from './ChatScreen';

export default function Hero() {
  return (
    <section id="overview" className="bg-fog px-5 pt-14 sm:px-6 sm:pt-16 lg:pt-20">
      <div className="mx-auto grid max-w-[1200px] grid-cols-1 items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
        {/* Left: copy */}
        <div className="min-w-0 text-center lg:text-left">
          <p className="animate-rise font-text text-[clamp(16px,2vw,20px)] font-semibold tracking-[-0.015em] text-ink">
            Open source · MIT · Self-hosted
          </p>
          <h1 className="animate-rise mt-3 font-display text-[clamp(40px,7vw,80px)] font-bold leading-[1.04] tracking-[-0.022em] text-ink">
            WhatsApp, on autopilot.
          </h1>
          <p className="animate-rise mx-auto mt-5 max-w-[560px] font-text text-[clamp(17px,2.2vw,21px)] font-light leading-[1.4] tracking-[-0.01em] text-graphite lg:mx-0">
            An AI agent that lives on your own WhatsApp number — replying to
            customers, capturing leads, and booking meetings around the clock.
            Powered by Cerebras&nbsp;Llama. Free to run.
          </p>

          <div className="animate-rise mt-8 flex flex-col items-center justify-center gap-x-7 gap-y-4 sm:flex-row lg:justify-start">
            <a
              href={REPO_URL}
              target="_blank"
              rel="noreferrer"
              className="rounded-full bg-azure px-6 py-3 text-[17px] font-medium text-snow transition-opacity duration-100 hover:opacity-90"
            >
              Get started — it&apos;s free
            </a>
            <a
              href="#setup"
              className="group inline-flex items-center gap-1 text-[17px] font-medium text-cobalt"
            >
              See how it works
              <ArrowRight
                size={17}
                className="transition-transform duration-100 group-hover:translate-x-0.5"
              />
            </a>
          </div>
        </div>

        {/* Right: product image (phone) */}
        <div className="relative">
          <div
            className="pointer-events-none absolute inset-0 mx-auto my-auto h-[440px] max-w-[520px] rounded-full opacity-70 blur-3xl"
            style={{
              background:
                'radial-gradient(closest-side, rgba(37,211,102,0.22), rgba(245,245,247,0))',
            }}
          />
          <div className="relative animate-rise">
            <PhoneFrame>
              <ChatScreen />
            </PhoneFrame>
          </div>
        </div>
      </div>

      {/* One-line Claude Code setup */}
      <div className="animate-rise mx-auto mt-14 max-w-[1200px] pb-16 sm:mt-16 sm:pb-20">
        <CopyCommand />
      </div>
    </section>
  );
}
