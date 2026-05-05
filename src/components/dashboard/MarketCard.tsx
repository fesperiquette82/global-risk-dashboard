import { MarketCard as M } from '@/lib/types';
import { biasColor } from '@/lib/ui/format';
import { Badge } from '@/components/ui/Badge';

export function MarketCard({ card }: { card: M }) {
  return <div className='rounded border bg-white p-3'>
    <div className='mb-2 flex items-center justify-between'><h3 className='font-medium'>{card.market}</h3><Badge text={card.bias} className={biasColor(card.bias)} /></div>
    <p className='text-sm'>Probabilité indicative hausse 1M: <b>{card.up1m}%</b></p>
    <p className='text-sm'>Probabilité indicative baisse 1M: <b>{card.down1m}%</b></p>
    <p className='text-sm'>Probabilité indicative hausse 6M: <b>{card.up6m}%</b></p>
    <p className='text-sm'>Confiance: {card.confidence}</p>
    <p className='mt-1 text-xs text-slate-600'>Drivers: {card.drivers.join(', ') || 'n/a'}</p>
  </div>;
}
