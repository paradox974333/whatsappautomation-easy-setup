import { ArrowRight } from 'lucide-react';
import { REPO_URL } from '../data';
import DashboardMock from './DashboardMock';

export default function Showcase() {
  return (
    <section className="bg-fog px-5 py-20 sm:px-6 sm:py-24 lg:py-32">
      <div className="mx-auto grid max-w-[1200px] grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div className="min-w-0">
          <h2 className="font-display text-[clamp(28px,5vw,56px)] font-bold leading-[1.07] tracking-[-0.019em] text-ink">
            Every lead, in one place.
          </h2>
          <p className="mt-5 max-w-[480px] font-text text-[clamp(17px,2.2vw,20px)] font-light leading-[1.4] tracking-[-0.01em] text-graphite">
            A built-in dashboard shows every conversation, every captured lead,
            and every booked meeting — with a REST API to push it all into your
            CRM.
          </p>
          <a
            href={REPO_URL}
            target="_blank"
            rel="noreferrer"
            className="group mt-7 inline-flex items-center gap-1 text-[17px] font-medium text-cobalt"
          >
            Explore the project
            <ArrowRight
              size={17}
              className="transition-transform duration-100 group-hover:translate-x-0.5"
            />
          </a>
        </div>

        <div className="min-w-0 animate-rise">
          <DashboardMock />
        </div>
      </div>
    </section>
  );
}
