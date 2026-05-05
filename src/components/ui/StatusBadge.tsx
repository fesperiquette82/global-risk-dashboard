import { DataSourceStatus } from '@/lib/types';
import { statusColor } from '@/lib/ui/format';
import { Badge } from './Badge';
export function StatusBadge({ status }: { status: DataSourceStatus }) { return <Badge text={status} className={statusColor(status)} />; }
