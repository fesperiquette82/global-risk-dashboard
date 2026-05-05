import { Indicator } from '@/lib/types';
import { fetchFred } from './fred';
import { fetchCoinGecko } from './coingecko';
import { fetchGdelt } from './gdelt';
import { fetchAlphaVantage } from './alphavantage';
import { commodityMockIndicators, cryptoMockIndicators, geopoliticsMockIndicators, macroMockIndicators } from './mock';

export async function fetchAllIndicators(): Promise<Indicator[]> {
  const [fred, cg, gdelt, alpha] = await Promise.all([fetchFred(), fetchCoinGecko(), fetchGdelt(), fetchAlphaVantage()]);

  return [
    ...(fred.length ? fred : macroMockIndicators()),
    ...(cg.length ? cg : cryptoMockIndicators()),
    ...(gdelt.length ? gdelt : geopoliticsMockIndicators()),
    ...(alpha.length ? alpha : commodityMockIndicators()),
  ];
}
