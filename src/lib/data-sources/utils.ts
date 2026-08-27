export async function fetchJson(url:string, ms=7000, revalidate=300){const c=new AbortController(); const t=setTimeout(()=>c.abort(),ms); try{const r=await fetch(url,{signal:c.signal,next:{revalidate}}); if(!r.ok) throw new Error(String(r.status)); return await r.json();} finally{clearTimeout(t);} }

// Alpha Vantage free tier: 25 req/day. Daily-close data doesn't need faster refresh.
export const ALPHA_VANTAGE_REVALIDATE_SECONDS = 86400;
