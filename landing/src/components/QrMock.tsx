import WhatsAppLogo from './WhatsAppLogo';

const N = 25;
const M = 8;

/** Deterministic QR-style matrix (decorative — three finder eyes + data fill). */
function buildCells(): Array<[number, number]> {
  const cells: Array<[number, number]> = [];

  const finder = (ox: number, oy: number) => {
    for (let y = 0; y < 7; y++) {
      for (let x = 0; x < 7; x++) {
        const border = x === 0 || x === 6 || y === 0 || y === 6;
        const core = x >= 2 && x <= 4 && y >= 2 && y <= 4;
        if (border || core) cells.push([ox + x, oy + y]);
      }
    }
  };
  finder(0, 0);
  finder(N - 7, 0);
  finder(0, N - 7);

  const inFinderZone = (x: number, y: number) =>
    (x < 8 && y < 8) || (x >= N - 8 && y < 8) || (x < 8 && y >= N - 8);

  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      if (inFinderZone(x, y)) continue;
      if ((x * 31 + y * 17 + x * y * 7) % 5 < 2) cells.push([x, y]);
    }
  }
  return cells;
}

const CELLS = buildCells();

/** Mock of the QR-pairing screen shown in the app dashboard. */
export default function QrMock() {
  return (
    <div className="mx-auto w-full max-w-[360px] rounded-card bg-snow p-7 text-center ring-1 ring-silver-mist">
      <WhatsAppLogo size={40} className="mx-auto" />
      <h3 className="mt-4 font-display text-[20px] font-semibold tracking-[-0.015em] text-ink">
        Link your WhatsApp
      </h3>
      <p className="mt-1 text-[13px] leading-[1.45] tracking-[-0.003em] text-graphite">
        Scan once with your phone — it stays connected.
      </p>

      <div className="mx-auto mt-5 w-fit rounded-2xl bg-fog p-4">
        <svg
          width={N * M}
          height={N * M}
          viewBox={`0 0 ${N * M} ${N * M}`}
          shapeRendering="crispEdges"
          role="img"
          aria-label="QR code"
        >
          <rect width={N * M} height={N * M} fill="#f5f5f7" />
          {CELLS.map(([x, y], i) => (
            <rect key={i} x={x * M} y={y * M} width={M} height={M} fill="#1d1d1f" />
          ))}
        </svg>
      </div>

      <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#25D366]/15 px-3 py-1.5 text-[12px] font-medium text-[#1a8a4a]">
        <span className="h-2 w-2 rounded-full bg-[#25D366]" />
        Waiting to connect…
      </div>
    </div>
  );
}
