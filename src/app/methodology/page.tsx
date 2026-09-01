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
    <SectionCard title='Module Portefeuille'>Les signaux par ticker (tendance, momentum, volatilité réalisée, P/E, dividende) sont calculés à partir de données réelles (Alpha Vantage), rafraîchies une fois par jour pour respecter le quota gratuit de 25 requêtes/jour. Watchlist par défaut : SPY, QQQ, VTI (personnalisable via <code>PORTFOLIO_TICKERS</code>). Ce sont des faits observés, pas des prévisions.</SectionCard>
    <SectionCard title='Pourquoi les dates diffèrent selon les indicateurs'>
      <p className='text-sm'>Chaque source publie à son propre rythme réel — ce n&apos;est pas un dysfonctionnement :</p>
      <ul className='list-disc pl-5 text-sm space-y-1 mt-1'>
        <li><strong>CPI (inflation)</strong> : publication mensuelle avec ~1 à 2 mois de décalage, c&apos;est la norme aux États-Unis.</li>
        <li><strong>Taux, VIX, spread de crédit</strong> : mis à jour chaque jour ouvré par FRED.</li>
        <li><strong>Bitcoin / Ethereum</strong> : quasi temps réel via CoinGecko.</li>
        <li><strong>Pétrole (WTI) et module Portefeuille</strong> : rafraîchis au plus une fois par jour, pour rester sous le quota gratuit Alpha Vantage — peuvent repasser en <code>mock</code> temporairement si le quota du jour est épuisé (ex: plusieurs déploiements rapprochés). Cela se résout automatiquement au renouvellement quotidien du quota.</li>
      </ul>
    </SectionCard>
    <SectionCard title='Sentiment de marché'>
      <p className='text-sm'>Indicateur maison inspiré du CNN Fear &amp; Greed Index, mais <strong>ce n&apos;est pas une donnée CNN</strong> — CNN n&apos;expose aucune API publique, et scraper leur page serait fragile et contraire à leurs conditions d&apos;utilisation. Ce score est recalculé à partir de 3 signaux réels déjà utilisés ailleurs dans le dashboard :</p>
      <ul className='list-disc pl-5 text-sm space-y-1 mt-1'>
        <li><strong>Volatilité</strong> : VIX (FRED), calme (VIX≈12) = avidité, panique (VIX≈37) = peur.</li>
        <li><strong>Crédit</strong> : spread High Yield (FRED), l&apos;inverse du score de stress de crédit.</li>
        <li><strong>Momentum</strong> : position du prix de SPY par rapport à sa moyenne mobile 50 jours (Alpha Vantage).</li>
      </ul>
      <p className='text-sm mt-1'>CNN utilise 7 facteurs (dont le ratio put/call et la largeur de marché) pour lesquels aucune API gratuite fiable n&apos;est disponible ici — ce score n&apos;est donc pas directement comparable à l&apos;indice CNN, juste un signal de même inspiration construit sur des données réelles.</p>
    </SectionCard>
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
