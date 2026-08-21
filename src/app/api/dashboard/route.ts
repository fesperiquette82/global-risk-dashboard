import { NextResponse } from 'next/server';import { getDashboardModel } from '@/lib/model';
export const revalidate = 300;
export async function GET(){return NextResponse.json(await getDashboardModel());}
