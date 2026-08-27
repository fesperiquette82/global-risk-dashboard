import { MarketSentiment } from '@/lib/types';
import { sentimentColor } from '@/lib/ui/format';
import { Badge } from '@/components/ui/Badge';

export function SentimentCard({ sentiment }: { sentiment: MarketSentiment }) {
  return <div className='rounded border bg-white p-4'>
    <div className='mb-2 flex items-center justify-between'>
      <h2 className='text-lg font-semibold'>Sentiment de marché</h2>
      <Badge text={sentiment.label} className={sentimentColor(sentiment.label)} />
    </div>
    <p className='mb-2 text-3xl font-bold'>{sentiment.score}/100</p>
    <div className='h-3 w-full rounded bg-slate-200'><div className='h-3 rounded bg-slate-800' style={{ width: `${sentiment.score}%` }} /></div>
    <p className='mt-2 text-xs text-slate-600'>Volatilité: {sentiment.components.volatility}/100 · Crédit: {sentiment.components.credit}/100 · Momentum: {sentiment.components.momentum}/100</p>
    <p className='text-xs text-slate-500'>Indicateur maison inspiré du CNN Fear &amp; Greed Index, calculé à partir de VIX, spread de crédit et momentum — pas une donnée CNN.</p>
  </div>;
}
