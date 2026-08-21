import { getDashboardModel } from '@/lib/model';
import { IndicatorTable } from '@/components/dashboard/IndicatorTable';

export const revalidate = 300;

export default async function Indicators() {
  const { indicators } = await getDashboardModel();

  return <div className='space-y-3'>
    <h1 className='text-xl font-semibold'>Indicators</h1>
    <div className='rounded border bg-white p-4'><IndicatorTable indicators={indicators} /></div>
  </div>;
}
