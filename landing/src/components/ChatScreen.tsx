import { ChevronLeft, Phone, Plus, Send, Video } from 'lucide-react';

function Bubble({
  side,
  time,
  children,
}: {
  side: 'in' | 'out';
  time: string;
  children: React.ReactNode;
}) {
  const out = side === 'out';
  return (
    <div className={`flex ${out ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`relative max-w-[80%] rounded-lg px-2.5 py-1.5 text-[13.5px] leading-[1.35] tracking-[-0.003em] text-[#111b21] shadow-sm ${
          out ? 'bg-[#d9fdd3]' : 'bg-white'
        }`}
      >
        {children}
        <span className="ml-2 inline-block translate-y-0.5 text-[10px] text-[#667781]">
          {time}
        </span>
      </div>
    </div>
  );
}

/** Full-screen WhatsApp conversation UI — sits inside the phone frame. */
export default function ChatScreen() {
  return (
    <div className="flex h-full flex-col bg-[#efeae2]">
      {/* Status + header (WhatsApp teal) */}
      <div className="bg-[#075e54] text-white">
        <div className="flex items-center justify-between px-5 pt-2.5 text-[12px] font-semibold">
          <span>9:41</span>
          <span className="flex items-center gap-1 text-[10px]">●●● 5G ▮▮▮</span>
        </div>
        <div className="flex items-center gap-3 px-3 py-2">
          <ChevronLeft size={20} className="shrink-0" />
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-[13px] font-semibold">
            B
          </div>
          <div className="min-w-0 flex-1 leading-tight">
            <div className="truncate text-[15px] font-semibold">Your Business</div>
            <div className="text-[11px] text-white/80">online · AI assistant</div>
          </div>
          <Video size={18} className="shrink-0" />
          <Phone size={17} className="shrink-0" />
        </div>
      </div>

      {/* Messages */}
      <div className="flex flex-1 flex-col gap-2 overflow-hidden px-3 py-3">
        <span className="mx-auto rounded-md bg-white/70 px-2.5 py-0.5 text-[10px] font-medium text-[#54656f] shadow-sm">
          TODAY
        </span>
        <Bubble side="in" time="2:14 PM">
          Hi! Do you build websites? How much?
        </Bubble>
        <Bubble side="out" time="2:14 PM">
          We do! 🙌 Every project is custom-priced to your goals. What do you have
          in mind?
        </Bubble>
        <Bubble side="in" time="2:15 PM">
          A site + Instagram. Can we talk tomorrow at 3pm?
        </Bubble>
        <Bubble side="out" time="2:15 PM">
          Booked for tomorrow, 3:00 PM ✅ Sent you the meeting link — talk then!
        </Bubble>
        <span className="mx-auto mt-1 flex items-center gap-1.5 rounded-full bg-[#075e54]/10 px-2.5 py-1 text-[10px] font-semibold text-[#075e54]">
          ⚡ Lead captured · Meeting booked · Owner notified
        </span>
      </div>

      {/* Input bar */}
      <div className="flex items-center gap-2 px-2.5 pb-3 pt-1">
        <div className="flex flex-1 items-center gap-2 rounded-full bg-white px-3 py-2 text-[13px] text-[#8696a0] shadow-sm">
          <Plus size={16} />
          Message
        </div>
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#00a884] text-white">
          <Send size={16} />
        </div>
      </div>
    </div>
  );
}
