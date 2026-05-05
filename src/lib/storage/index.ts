import fs from 'node:fs/promises';import path from 'node:path';import { DashboardModel } from '@/lib/types';
const file=path.join(process.cwd(),'data/snapshots.json'); const isVercel=!!process.env.VERCEL;
export async function saveSnapshot(model:DashboardModel){if(isVercel) return; await fs.mkdir(path.dirname(file),{recursive:true}); let arr:DashboardModel[]=[]; try{arr=JSON.parse(await fs.readFile(file,'utf-8'));}catch{} arr.unshift(model); await fs.writeFile(file,JSON.stringify(arr.slice(0,90),null,2));}
export async function loadSnapshots():Promise<DashboardModel[]>{try{return JSON.parse(await fs.readFile(file,'utf-8'));}catch{return [];}}
