import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { CLAUDE_COMMAND } from '../data';
import AiToolsRow from './AiToolsRow';

/**
 * The hero centerpiece: paste this one prompt into any AI coding agent and it
 * sets up the whole project. Subtly highlighted (Apple-style) with a soft glow
 * ring and a faint tinted surface to draw the eye without shouting.
 */
export default function CopyCommand() {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(CLAUDE_COMMAND);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable — ignore */
    }
  };

  return (
    <div className="relative mx-auto w-full max-w-[720px]">
      {/* Soft highlight glow behind the card */}
      <div
        className="pointer-events-none absolute -inset-px rounded-[30px] opacity-70 blur-xl"
        style={{
          background:
            'radial-gradient(120% 120% at 50% 0%, rgba(0,113,227,0.16), rgba(37,211,102,0.10) 45%, rgba(245,245,247,0) 75%)',
        }}
      />

      <div className="relative overflow-hidden rounded-card bg-snow p-5 text-left ring-1 ring-black/[0.06] sm:p-6">
        {/* Faint top sheen */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px"
          style={{
            background:
              'linear-gradient(90deg, transparent, rgba(0,0,0,0.08), transparent)',
          }}
        />

        <div className="mb-3">
          <span className="text-[12px] font-semibold tracking-[-0.003em] text-ink">
            Set it up in one line with your AI coding agent
          </span>
        </div>

        <div className="rounded-2xl bg-fog p-4">
          <p className="break-words font-text text-[14px] leading-[1.5] tracking-[-0.003em] text-slate">
            {CLAUDE_COMMAND}
          </p>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <span className="hidden text-[12px] tracking-[-0.003em] text-graphite sm:inline">
            It clones, installs &amp; configures everything for you.
          </span>
          <button
            onClick={copy}
            aria-label="Copy command"
            className="flex shrink-0 items-center gap-1.5 rounded-[10px] bg-ink px-3.5 py-2 text-[13px] font-medium text-snow transition-opacity duration-100 hover:opacity-80"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>

        {/* Supported AI tools */}
        <div className="mt-5 border-t border-silver-mist pt-4">
          <AiToolsRow />
        </div>
      </div>
    </div>
  );
}
