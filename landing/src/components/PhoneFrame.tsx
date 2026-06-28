/**
 * Realistic phone mockup — titanium-style bezel, dynamic island, rounded screen.
 * Children fill the screen. A soft drop shadow makes it read as a product shot
 * (product imagery, distinct from the page's flat shadowless cards).
 */
export default function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative mx-auto w-[290px] max-w-full sm:w-[310px]">
      <div className="rounded-[48px] bg-gradient-to-b from-[#2a2a2c] to-[#0e0e0f] p-[11px] shadow-[0_40px_80px_-24px_rgba(0,0,0,0.45)]">
        <div className="relative aspect-[9/19.5] overflow-hidden rounded-[38px] bg-black">
          {/* Dynamic island */}
          <div className="absolute left-1/2 top-[10px] z-20 h-[24px] w-[88px] -translate-x-1/2 rounded-full bg-black" />
          <div className="h-full w-full">{children}</div>
        </div>
      </div>
    </div>
  );
}
