type Lead = {
  name: string;
  business: string;
  status: 'New' | 'Qualified' | 'Contacted';
  date: string;
};

const LEADS: Lead[] = [
  { name: 'Priya Sharma', business: 'Bloom Florals', status: 'Qualified', date: 'Jun 28' },
  { name: 'David Okafor', business: "David's Fashion", status: 'New', date: 'Jun 28' },
  { name: 'Aisha Khan', business: 'Cedar Café', status: 'Contacted', date: 'Jun 27' },
  { name: 'Marco Rossi', business: 'Rossi Studios', status: 'Qualified', date: 'Jun 27' },
];

const STATUS_STYLE: Record<Lead['status'], string> = {
  New: 'bg-azure/10 text-azure',
  Qualified: 'bg-[#25D366]/15 text-[#1a8a4a]',
  Contacted: 'bg-fog text-graphite',
};

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl bg-fog p-4">
      <div className="font-display text-[26px] font-semibold tracking-[-0.015em] text-ink">
        {value}
      </div>
      <div className="mt-0.5 text-[12px] tracking-[-0.003em] text-graphite">{label}</div>
    </div>
  );
}

/** Mock of the built-in admin dashboard — a clean browser window. */
export default function DashboardMock() {
  return (
    <div className="overflow-hidden rounded-card bg-snow ring-1 ring-silver-mist">
      {/* Window chrome */}
      <div className="flex items-center gap-3 border-b border-silver-mist bg-fog px-4 py-3">
        <div className="flex gap-1.5">
          <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
          <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
          <span className="h-3 w-3 rounded-full bg-[#28c840]" />
        </div>
        <div className="mx-auto flex items-center gap-1.5 rounded-md bg-snow px-3 py-1 text-[11px] tracking-[-0.003em] text-graphite ring-1 ring-silver-mist">
          localhost:3000/admin
        </div>
      </div>

      {/* Body */}
      <div className="p-5">
        <h3 className="font-display text-[20px] font-semibold tracking-[-0.015em] text-ink">
          Leads
        </h3>
        <p className="mt-0.5 text-[13px] tracking-[-0.003em] text-graphite">
          Captured automatically from conversations
        </p>

        <div className="mt-4 grid grid-cols-3 gap-3">
          <Stat value="128" label="New leads" />
          <Stat value="34" label="Meetings booked" />
          <Stat value="2.4k" label="Messages handled" />
        </div>

        <div className="mt-5 overflow-hidden rounded-2xl ring-1 ring-silver-mist">
          <div className="grid grid-cols-[1.4fr_1.2fr_0.9fr_0.6fr] gap-2 bg-fog px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-graphite">
            <span>Name</span>
            <span>Business</span>
            <span>Status</span>
            <span className="text-right">Date</span>
          </div>
          {LEADS.map((l) => (
            <div
              key={l.name}
              className="grid grid-cols-[1.4fr_1.2fr_0.9fr_0.6fr] items-center gap-2 border-t border-silver-mist px-4 py-3 text-[13px] tracking-[-0.003em]"
            >
              <span className="truncate font-medium text-ink">{l.name}</span>
              <span className="truncate text-graphite">{l.business}</span>
              <span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${STATUS_STYLE[l.status]}`}
                >
                  {l.status}
                </span>
              </span>
              <span className="text-right text-graphite">{l.date}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
