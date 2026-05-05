import { NextResponse } from 'next/server';import { loadSnapshots } from '@/lib/storage';import { computeDashboardModel } from '@/lib/scoring';import { mockIndicators } from '@/lib/data-sources/mock';
export async function GET(){const snaps=await loadSnapshots(); if(snaps.length) return NextResponse.json(snaps[0]); return NextResponse.json(computeDashboardModel(mockIndicators()));}
