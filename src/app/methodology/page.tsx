import { SectionCard } from '@/components/ui/SectionCard';

export default function Methodology() {
  return <div className='space-y-3'>
    <h1 className='text-xl font-semibold'>Methodology</h1>
    <SectionCard title='Ce que mesure le score'>Le score agrège des signaux macro réels (taux, VIX, spread de crédit, inflation, chômage), géopolitiques et crypto pour une lecture synthétique de risque 0–100. C&apos;est une heuristique documentée, pas un modèle statistique validé ou backtesté.</SectionCard>
    <SectionCard title='Sources de données'>
      <table className='w-full text-sm'><tbody>
        <tr><td>Taux US 10Y/2Y, spread 10Y-2Y</td><td>FRED (DGS10, DGS2, T10Y2Y)</td></tr>
        <tr><td>VIX (volatilité)</td><td>FRED (VIXCLS)</td></tr>
        <tr><td>Spread de crédit High Yield</td><td>FRED (BAMLH0A0HYM2)</td></tr>
        <tr><td>Inflation (CPI, %YoY)</td><td>FRED (CPIAUCSL, units=pc1)</td></tr>
        <tr><td>Chômage US</td><td>FRED (UNRATE)</td></tr>
        <tr><td>Pétrole (WTI)</td><td>Alpha Vantage</td></tr>
        <tr><td>Bitcoin / Ethereum</td><td>CoinGecko (sans clé requise)</td></tr>
        <tr><td>Volume géopolitique</td><td>GDELT</td></tr>
      </tbody></table>
    </SectionCard>
    <SectionCard title='Formules des sous-scores (seuils indicatifs)'>
      <ul className='list-disc pl-5 text-sm space-y-1'>
        <li>Crédit : spread HY ≈ 3–5% en régime normal, &gt;8% en crise (2008 ≈ 20%, 2020 ≈ 11%, 2022 ≈ 5,5%).</li>
        <li>Inflation : écart au-dessus de la cible Fed de 2% YoY.</li>
        <li>Taux : VIX au-dessus de 15 (niveau &laquo; calme &raquo; historique) combiné au pétrole.</li>
        <li>Croissance : inversion de la courbe 10Y-2Y et chômage au-dessus de 4%.</li>
      </ul>
    </SectionCard>
    <SectionCard title='Lecture des régimes'>
      <table className='w-full text-sm'><tbody>
        <tr><td>0–30</td><td>Risk-on</td></tr>
        <tr><td>30–45</td><td>Normal</td></tr>
        <tr><td>45–60</td><td>Fragile</td></tr>
        <tr><td>60–75</td><td>Stress élevé</td></tr>
        <tr><td>75–100</td><td>Crise</td></tr>
      </tbody></table>
    </SectionCard>
    <SectionCard title='Module Portefeuille'>Les signaux par ticker (tendance, momentum, volatilité réalisée, P/E, dividende) sont calculés à partir de données réelles (Alpha Vantage), rafraîchies une fois par jour pour respecter le quota gratuit de 25 requêtes/jour. Ce sont des faits observés, pas des prévisions.</SectionCard>
    <SectionCard title="Ce que ce dashboard ne fait pas">
      <ul className='list-disc pl-5 text-sm space-y-1'>
        <li>Pas de backtesting ni de validation statistique du pouvoir prédictif du score.</li>
        <li>Pas de modèle probabiliste calibré : aucune &laquo; probabilité &raquo; de hausse/baisse n&apos;est fournie.</li>
        <li>Pas d&apos;analyse fondamentale approfondie ni de recommandation d&apos;achat/vente.</li>
        <li>Pas de données intraday : clôtures quotidiennes uniquement.</li>
      </ul>
    </SectionCard>
    <SectionCard title='Limites des données gratuites'>Les APIs gratuites peuvent être limitées, retardées, incomplètes, ou indisponibles. Des fallbacks mock sont utilisés pour continuité produit, et le statut de chaque indicateur (live/mock/stale/error) est toujours affiché.</SectionCard>
    <SectionCard title='Rôle de Gemini'>Gemini est optionnel et reçoit uniquement un JSON déjà calculé. Si indisponible ou invalide, fallback déterministe local.</SectionCard>
    <SectionCard title='Disclaimer'>Macro Risk Radar est un outil expérimental d’analyse macro-financière. Les scores sont indicatifs, ne constituent pas un conseil financier, et peuvent être erronés ou incomplets.</SectionCard>
  </div>;
}
