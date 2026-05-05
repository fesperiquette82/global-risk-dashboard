import { loadSnapshots } from '@/lib/storage';
import { computeDashboardModel } from '@/lib/scoring';
import { mockIndicators } from '@/lib/data-sources/mock';
import { ScoreCard } from '@/components/dashboard/ScoreCard';
import { MarketCard } from '@/components/dashboard/MarketCard';
import { SectionCard } from '@/components/ui/SectionCard';
import { StressBarChart } from '@/components/charts/StressBarChart';
import { SourceStatusChart } from '@/components/charts/SourceStatusChart';

export default async function Page() {
  const snapshots = await loadSnapshots();
  const d = snapshots[0] ?? computeDashboardModel(mockIndicators());

  const stress = [
    { name: 'Rates', value: d.ratesStressScore }, { name: 'Inflation', value: d.inflationStressScore },
    { name: 'Growth', value: d.growthStressScore }, { name: 'Market', value: d.marketStressScore },
    { name: 'Geo', value: d.geopoliticalStressScore }, { name: 'Crypto', value: d.cryptoRiskScore }, { name: 'Commo', value: d.commodityRiskScore },
  ];
  const statusMap = d.indicators.reduce<Record<string, number>>((acc, x) => ({ ...acc, [x.status]: (acc[x.status] ?? 0) + 1 }), { live: 0, mock: 0, stale: 0, error: 0 });
  const statusData = Object.entries(statusMap).map(([name, value]) => ({ name, value }));

  return <main className='space-y-4'>
    <h1 className='text-2xl font-semibold'>Macro Risk Radar</h1>
    <ScoreCard model={d} />

    <div className='grid gap-3 md:grid-cols-2 lg:grid-cols-3'>{d.marketCards.map((m) => <MarketCard key={m.market} card={m} />)}</div>

    <div className='grid gap-4 md:grid-cols-2'>
      <SectionCard title='Sous-scores de stress'><StressBarChart scores={stress} /></SectionCard>
      <SectionCard title='Statut des sources'><SourceStatusChart data={statusData} /></SectionCard>
    </div>

    <div className='grid gap-4 md:grid-cols-3'>
      <SectionCard title='Drivers positifs'><ul className='text-sm'>{d.positiveDrivers.map((x) => <li key={x}>• {x}</li>)}</ul></SectionCard>
      <SectionCard title='Drivers négatifs'><ul className='text-sm'>{d.negativeDrivers.map((x) => <li key={x}>• {x}</li>)}</ul></SectionCard>
      <SectionCard title='Alertes'><p className='text-sm'>{d.alerts.length ? d.alerts.join(', ') : 'Aucune alerte majeure détectée'}</p></SectionCard>
    </div>
  </main>;
}
