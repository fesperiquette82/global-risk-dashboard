import { loadSnapshots } from '@/lib/storage';
import { mockIndicators } from '@/lib/data-sources/mock';
import { IndicatorTable } from '@/components/dashboard/IndicatorTable';

export default async function Indicators() {
  const snapshots = await loadSnapshots();
  const indicators = snapshots[0]?.indicators ?? mockIndicators();

  return <div className='space-y-3'>
    <h1 className='text-xl font-semibold'>Indicators</h1>
    <div className='rounded border bg-white p-4'><IndicatorTable indicators={indicators} /></div>
  </div>;
}
