import { Check, X } from "lucide-react";

interface ComparisonViewProps {
  eyebrow: string;
  title: string;
  subtitle: string;
  ourLabel: string;
  theirLabel: string;
  rows: Array<{ criteria: string; ours: string | boolean; theirs: string | boolean }>;
}

export function ComparisonView({ eyebrow, title, subtitle, ourLabel, theirLabel, rows }: ComparisonViewProps) {
  return (
    <section className="comparison" id="comparison">
      <div className="comparison__inner">
        <div className="comparison__header">
          <p className="section-eyebrow">{eyebrow}</p>
          <h2 className="section-title">{title}</h2>
          <p className="section-subtitle">{subtitle}</p>
        </div>
        <div className="comparison__table-wrap">
          <table className="comparison__table">
            <thead>
              <tr>
                <th className="comparison__th comparison__th--criteria">Criteria</th>
                <th className="comparison__th comparison__th--ours">
                  <span className="comparison__ours-label">{ourLabel}</span>
                </th>
                <th className="comparison__th comparison__th--theirs">{theirLabel}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={row.criteria} className={`comparison__row ${i % 2 === 0 ? "comparison__row--even" : ""}`}>
                  <td className="comparison__td comparison__td--criteria">{row.criteria}</td>
                  <td className="comparison__td comparison__td--ours">
                    {typeof row.ours === "boolean" ? (
                      row.ours ? <Check className="comparison__check" strokeWidth={2.5} /> : <X className="comparison__cross" strokeWidth={2.5} />
                    ) : (
                      <span className="comparison__text-value">{row.ours}</span>
                    )}
                  </td>
                  <td className="comparison__td comparison__td--theirs">
                    {typeof row.theirs === "boolean" ? (
                      row.theirs ? <Check className="comparison__check" strokeWidth={2.5} /> : <X className="comparison__cross" strokeWidth={2.5} />
                    ) : (
                      <span className="comparison__text-value comparison__text-value--dim">{row.theirs}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

export function Comparison({ block }: { block: LandingBlock<ComparisonContent> }) {
  const content = block.content ?? {} as ComparisonContent;
  return (
    <ComparisonView
      eyebrow={content.eyebrow ?? "Why it matters"}
      title={block.title ?? "Le Goût du Vrai"}
      subtitle={block.subtitle ?? "Not all vanilla is created equal. Here's what sets ours apart."}
      ourLabel={content.ourLabel ?? "🌿 Épices SAVA"}
      theirLabel={content.theirLabel ?? "Supermarket Spices"}
      rows={content.rows ?? []}
    />
  );
}