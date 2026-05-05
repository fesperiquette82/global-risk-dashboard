import { DashboardModel } from '@/lib/types';
import { RiskRegimeBadge } from '@/components/ui/RiskRegimeBadge';

export function ScoreCard({ model }: { model: DashboardModel }) {
  const live = model.indicators.filter((x) => x.status === 'live').length;
  const mock = model.indicators.filter((x) => x.status === 'mock').length;
  return <div className='rounded border bg-white p-4'>
    <div className='mb-2 flex items-center justify-between'>
      <h2 className='text-lg font-semibold'>Global Risk Score</h2>
      <RiskRegimeBadge regime={model.riskRegime} />
    </div>
    <p className='mb-2 text-3xl font-bold'>{model.globalRiskScore}/100</p>
    <div className='h-3 w-full rounded bg-slate-200'><div className='h-3 rounded bg-slate-800' style={{ width: `${model.globalRiskScore}%` }} /></div>
    <p className='mt-2 text-xs text-slate-600'>Dernière mise à jour: {new Date(model.date).toLocaleString()}</p>
    <p className='text-xs text-slate-600'>Sources: {live} live / {mock} mock</p>
  </div>;
}
