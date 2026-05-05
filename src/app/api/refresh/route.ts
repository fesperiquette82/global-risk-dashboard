import { NextResponse } from 'next/server';import { fetchAllIndicators } from '@/lib/data-sources';import { computeDashboardModel } from '@/lib/scoring';import { saveSnapshot } from '@/lib/storage';
export async function POST(){const indicators=await fetchAllIndicators(); const model=computeDashboardModel(indicators); await saveSnapshot(model); return NextResponse.json(model);}
