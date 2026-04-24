import { LucideIcon } from "./lucide-icon";

interface TrustPillar {
  id: string;
  title: string;
  description: string;
  icon: string;
}

interface TrustBarViewProps {
  pillars: TrustPillar[];
}

export function TrustBarView({ pillars }: TrustBarViewProps) {
  if (!pillars.length) return null;

  return (
    <section className="trust-bar-section">
      <div className="trust-bar-container">
        {pillars.map((pillar, i) => (
          <div key={pillar.id} className="trust-pillar" style={{ animationDelay: `${i * 80}ms` }}>
            <span className="trust-pillar__icon-wrap">
              <LucideIcon name={pillar.icon} className="trust-pillar__icon" strokeWidth={1.5} />
            </span>
            <div className="trust-pillar__text">
              <p className="trust-pillar__title">{pillar.title}</p>
              <p className="trust-pillar__desc">{pillar.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// Smart component – reads from block.content
export function TrustBar({ block }: { block: LandingBlock }) {
  const pillars: TrustPillar[] = block.content?.pillars ?? [];

  return <TrustBarView pillars={pillars} />;
}