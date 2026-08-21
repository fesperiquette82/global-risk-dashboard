import { loadSnapshots } from '@/lib/storage';
import { fetchAllIndicators } from '@/lib/data-sources';
import { computeDashboardModel } from '@/lib/scoring';
import { DashboardModel } from '@/lib/types';

export async function getDashboardModel(): Promise<DashboardModel> {
  const snapshots = await loadSnapshots();
  if (snapshots.length) return snapshots[0];
  return computeDashboardModel(await fetchAllIndicators());
}
