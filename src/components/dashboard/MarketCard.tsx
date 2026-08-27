import { MarketCard as M } from '@/lib/types';
import { biasColor } from '@/lib/ui/format';
import { Badge } from '@/components/ui/Badge';

export function MarketCard({ card }: { card: M }) {
  return <div className='rounded border bg-white p-3'>
    <div className='mb-2 flex items-center justify-between'><h3 className='font-medium'>{card.market}</h3><Badge text={card.bias} className={biasColor(card.bias)} /></div>
    <p className='text-sm'>Score de stress: <b>{card.stressScore}/100</b></p>
    <p className='text-sm'>Confiance (couverture live): {card.confidence}</p>
    <p className='mt-1 text-xs text-slate-600'>Drivers: {card.drivers.join(', ') || 'n/a'}</p>
  </div>;
}
