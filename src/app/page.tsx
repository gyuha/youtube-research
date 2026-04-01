import { dashboardHeading, dashboardSummary } from '@/app/dashboard-copy';

export default function HomePage() {
  return (
    <main className="page-shell">
      <section className="hero-panel">
        <p className="eyebrow">Internal dashboard</p>
        <h1>{dashboardHeading}</h1>
        <p className="hero-copy">{dashboardSummary}</p>
      </section>
    </main>
  );
}
