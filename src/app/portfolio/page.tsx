import { getDashboardModel } from '@/lib/model';
import { fetchAssetSignals } from '@/lib/data-sources/equities';
import { AssetCard } from '@/components/dashboard/AssetCard';
import { RiskRegimeBadge } from '@/components/ui/RiskRegimeBadge';
import { SectionCard } from '@/components/ui/SectionCard';

export const revalidate = 86400;

export default async function Portfolio() {
  const [model, signals] = await Promise.all([getDashboardModel(), fetchAssetSignals()]);

  return <div className='space-y-3'>
    <h1 className='text-xl font-semibold'>Portefeuille</h1>
    <SectionCard title='Contexte macro'>
      <div className='flex items-center gap-2 text-sm'>
        <span>Régime de risque global:</span><RiskRegimeBadge regime={model.riskRegime} /><span>({model.globalRiskScore}/100)</span>
      </div>
      <p className='mt-1 text-xs text-slate-600'>Ce contexte est partagé par tous les actifs ci-dessous — ce n&apos;est pas un signal spécifique à chaque titre.</p>
    </SectionCard>
    <div className='grid gap-3 md:grid-cols-2 lg:grid-cols-3'>{signals.map((s) => <AssetCard key={s.ticker} signal={s} />)}</div>
    <p className='text-xs text-slate-500'>Tendance, momentum et volatilité sont des faits observés sur les clôtures récentes, pas des prévisions. Personnalisez la liste suivie via la variable d&apos;environnement <code>PORTFOLIO_TICKERS</code>.</p>
  </div>;
}
