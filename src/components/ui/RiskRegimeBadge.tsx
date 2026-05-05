import { regimeColor } from '@/lib/ui/format';
import { Badge } from './Badge';
export function RiskRegimeBadge({ regime }: { regime: string }) { return <Badge text={regime} className={regimeColor(regime)} />; }
