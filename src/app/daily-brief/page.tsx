import { computeDashboardModel } from '@/lib/scoring';
import { mockIndicators } from '@/lib/data-sources/mock';
import { generateDailyBrief } from '@/lib/ai';
import { SectionCard } from '@/components/ui/SectionCard';

export default async function DailyBrief() {
  const model = computeDashboardModel(mockIndicators());
  const brief = await generateDailyBrief(model);
  const isFallback = !process.env.GEMINI_API_KEY;

  return <div className='space-y-3'>
    <h1 className='text-xl font-semibold'>Daily Brief</h1>
    {isFallback && <p className='text-xs text-slate-500'>Brief généré localement (fallback déterministe).</p>}
    <SectionCard title='Résumé'>{brief.summary}</SectionCard>
    <div className='grid gap-3 md:grid-cols-2'>
      <SectionCard title='Scénario central'>{brief.baseCase}</SectionCard>
      <SectionCard title='Scénario de risque'>{brief.riskCase}</SectionCard>
      <SectionCard title='Drivers positifs'><ul>{brief.positiveDrivers.map((x) => <li key={x}>• {x}</li>)}</ul></SectionCard>
      <SectionCard title='Drivers négatifs'><ul>{brief.negativeDrivers.map((x) => <li key={x}>• {x}</li>)}</ul></SectionCard>
      <SectionCard title='Alertes'><ul>{brief.alerts.map((x) => <li key={x}>• {x}</li>)}</ul></SectionCard>
      <SectionCard title='Actifs les plus exposés'><ul>{brief.mostExposedAssets.map((x) => <li key={x}>• {x}</li>)}</ul></SectionCard>
    </div>
    <SectionCard title='À surveiller demain'><ul>{brief.watchTomorrow.map((x) => <li key={x}>• {x}</li>)}</ul></SectionCard>
  </div>;
}
