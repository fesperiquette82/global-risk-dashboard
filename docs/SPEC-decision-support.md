# Spec — Rendre le dashboard réellement utile pour des décisions actions/ETF

## 1. Constat de départ

Audit du code existant (voir conversation) :

1. **Le VIX est un mock permanent.** Aucun adaptateur (`fred.ts`, `alphavantage.ts`, `coingecko.ts`, `gdelt.ts`) ne va jamais chercher le VIX réel. Même avec toutes les clés API configurées, `vix_proxy` reste figé à sa valeur fictive (19) et pèse pourtant sur le sous-score "Rates".
2. **~11 indicateurs macro seulement**, aucune donnée par titre (pas de prix, pas de valorisation, pas de fondamentaux).
3. **Les "probabilités" affichées (hausse/baisse 1M/6M) sont fabriquées** — de simples transformations algébriques du score de stress (`100 - stress`, etc.), sans calibration historique. Elles ont l'apparence de prévisions quantitatives mais n'en sont pas.
4. **Toutes les classes d'actifs partagent le même score** avec un offset arbitraire (`market + 5`, `commod + 8`) — aucune différenciation réelle par actif.
5. **Le score global est une heuristique non validée statistiquement** (actuellement `max()` des 7 sous-scores, cf. PR #2).

Conclusion déjà partagée avec l'utilisateur : outil d'ambiance macro grossier, pas un outil d'aide à la décision de portefeuille.

## 2. Objectifs (v1)

- Éliminer les signaux **structurellement faux** (VIX toujours mocké) en branchant de vraies sources gratuites.
- Ajouter un vrai signal de **stress de crédit** (absent aujourd'hui), dimension macro importante et distincte du niveau de taux.
- Ajouter un module **actions/ETF** : liste de valeurs suivies, avec de vrais signaux par titre (tendance, momentum, volatilité réalisée, valorisation) — pas une copie du score macro.
- Remplacer les probabilités fabriquées par des **signaux honnêtes**, réels et clairement étiquetés (ex: "prix 6,2% au-dessus de la moyenne 50 jours"), plutôt que des pourcentages qui imitent une prévision calibrée.
- Rester dans le budget des APIs gratuites (FRED : généreux ; Alpha Vantage : **25 requêtes/jour** sur le tier gratuit ; CoinGecko : public, non authentifié).
- Conserver et étendre le système de statut existant (`live`/`mock`/`stale`/`error`) — la transparence sur la fraîcheur des données est déjà un bon principe du code actuel, à garder.

## 3. Non-objectifs (v1) — dit explicitement pour ne pas sur-promettre

- **Pas de moteur de backtesting** ni de validation statistique du pouvoir prédictif du score. Toujours une heuristique, mais désormais nourrie de vraies données de bout en bout, et étiquetée comme telle sur la page Methodology.
- **Pas de vrai modèle probabiliste calibré** — nécessiterait un historique d'entraînement et un track record que nous n'avons pas.
- **Pas de base de données persistante cross-déploiement** (Vercel KV, Postgres...) — reporté en v2. Les signaux techniques (tendance, momentum) sont recalculés à chaque cycle de cache à partir de l'historique renvoyé par Alpha Vantage lui-même, donc aucun stockage propre n'est nécessaire pour ce v1.
- **Pas d'intégration courtier** — la "watchlist" est une liste de tickers configurée statiquement (variable d'environnement), pas les positions réelles de l'utilisateur.
- **Pas de données intraday** — clôtures quotidiennes uniquement, cohérent avec le budget API gratuit.

## 4. Nouvelles sources de données

### 4.1 FRED (étendre `fred.ts`)

| Série FRED | id indicateur | Catégorie | Remplace |
|---|---|---|---|
| `VIXCLS` | `vix` | `volatility` | `vix_proxy` (mock permanent) |
| `BAMLH0A0HYM2` (spread High Yield OAS) | `credit_spread_hy` | `credit` | *(nouveau)* |
| `T10Y2Y` (spread 10Y-2Y, série FRED directe) | `yield_spread_10y_2y` | `growth` | calcul manuel `DGS10 - DGS2` |
| `CPIAUCSL` avec `units=pc1` (FRED calcule le %YoY côté serveur) | `cpi_yoy` | `inflation` | `cpi` (niveau d'indice brut, peu lisible) |
| `DGS10`, `DGS2`, `UNRATE` | inchangés | — | — |

Toutes ces séries sont **gratuites, sans authentification renforcée**, avec la même clé `FRED_API_KEY` déjà utilisée.

Correction de fiabilité au passage : une observation FRED manquante renvoie `"."` (convention FRED), donc `Number(value)` vaut `NaN` — le statut doit refléter `error` dans ce cas plutôt que `live` avec une valeur `null` (bug mineur préexistant).

### 4.2 Alpha Vantage (étendre `alphavantage.ts`, nouveau `equities.ts`)

Par ticker suivi :
- `OVERVIEW` : `PERatio`, `DividendYield`, `52WeekHigh`, `52WeekLow`, `Name`.
- `TIME_SERIES_DAILY` (`outputsize=compact`, ~100 dernières clôtures) : prix, variation 1J, rendement 3 mois (~63 séances), moyenne mobile 50 jours, volatilité réalisée annualisée (écart-type des rendements log sur 30 séances).

**Choix assumé** : `compact` (pas `full`) pour limiter la taille de payload et le temps d'exécution serverless. Conséquence : pas de moyenne mobile 200 jours ni de rendement 12 mois en v1 (nécessiterait `outputsize=full`, ~20 ans de données, plusieurs Mo par ticker) — piste v2 si utile.

**Budget de requêtes** : 2 appels/ticker (OVERVIEW + TIME_SERIES_DAILY). Avec la watchlist par défaut (5 tickers), cela représente 10 appels + 1 pour le pétrole (WTI, déjà existant) = 11 appels par cycle de rafraîchissement.

⚠️ **Correction critique** : le cache actuel (`next.revalidate: 300`, soit 5 min) appliqué à Alpha Vantage peut consommer jusqu'à 288 cycles/jour en cas de trafic régulier — très largement au-dessus des 25 requêtes/jour du tier gratuit. Ce spec fixe le cache Alpha Vantage (WTI + tickers) à **24h** (`revalidate: 86400`), cohérent avec des données de clôture quotidienne. Pour dimensionner une watchlist personnalisée : `(nb_tickers × 2) + 1 ≤ 25` ⇒ jusqu'à 12 tickers maximum avec ce budget.

### 4.3 Watchlist configurable

Nouvelle variable d'environnement `PORTFOLIO_TICKERS` (liste séparée par des virgules), documentée dans `.env.example`. Valeur par défaut si absente : `SPY,QQQ,VTI,IWM,EFA` (S&P 500, Nasdaq 100, marché US total, small caps, actions internationales développées) — un socle diversifié générique, à personnaliser par l'utilisateur avec ses propres tickers/ETF.

## 5. Modèle de score — changements

- **Nouveau sous-score `creditStressScore`** : `clamp100((spreadHY - 3) × 20)`. Repères réels : spread HY OAS ≈ 3-5% en régime normal, >8% en crise (2008 : ~20%, COVID 2020 : ~11%, 2022 : ~5,5%). Formule documentée sur la page Methodology, explicitement qualifiée d'heuristique.
- **`ratesStressScore`** utilise désormais `vix` (réel) au lieu de `vix_proxy` (mock).
- **`inflationStressScore`** utilise `cpi_yoy` (réel, %) au lieu du niveau d'indice brut : `clamp100(max(0, (cpiYoy - 2) × 25))` — cible Fed 2%, formule documentée.
- **`growthStressScore`** utilise le spread 10Y-2Y directement fourni par FRED (`T10Y2Y`), plus robuste qu'un calcul manuel.
- **`globalRiskScore`** reste `max()` des sous-scores (dont le nouveau `creditStressScore`), cohérent avec le choix déjà fait en PR #2 (un pilier très stressé doit pouvoir élever tout le régime).
- Aucune régression sur les indicateurs crypto/commodités/géopolitique existants.

## 6. Nouveau module "Portefeuille" (par ticker, signaux réels)

Nouveau type `AssetSignal` (voir §7) et nouvelle page `/portfolio` avec une carte par ticker :

- **Tendance** : prix vs. moyenne mobile 50 jours → étiquette *haussière / neutre / baissière* (seuil ±2%), avec le vrai pourcentage affiché.
- **Momentum** : rendement réel sur ~3 mois.
- **Volatilité réalisée** : écart-type annualisé des rendements quotidiens (30 dernières séances), donnée factuelle, pas une prévision.
- **Valorisation** : P/E et rendement du dividende bruts, affichés comme des faits (pas de verdict "cher/pas cher" sans base de comparaison historique fiable disponible en v1).
- **Range 52 semaines** : position du prix dans le range haut/bas.
- **Contexte macro** : rappel du régime de risque global (`globalRiskScore`/`riskRegime`), explicitement étiqueté comme un contexte partagé par tous les actifs, pas un signal spécifique au titre.

Les cartes `MarketCard` existantes (score macro par grande classe d'actifs) restent inchangées — ce nouveau module est additif, pas un remplacement risqué de code déjà testé.

## 7. Types (extraits)

```ts
export type TrendLabel = 'haussière' | 'neutre' | 'baissière';

export type AssetSignal = {
  ticker: string;
  name: string;
  price: number | null;
  changePct1d: number | null;
  return3m: number | null;
  priceVsSma50Pct: number | null;
  trend: TrendLabel;
  realizedVolAnnualizedPct: number | null;
  peRatio: number | null;
  dividendYieldPct: number | null;
  week52High: number | null;
  week52Low: number | null;
  status: DataSourceStatus;
  asOf: string | null;
};
```

`DashboardModel` gagne un champ `creditStressScore: number`.

## 8. Tests

- `fred.ts` : parsing des nouvelles séries (dont `units=pc1`), gestion des valeurs manquantes (`"."` → `status: 'error'`).
- `scoring.ts` : nouveau sous-score crédit borné 0-100, régime global toujours cohérent.
- `equities.ts` : calcul de SMA50/rendement 3M/volatilité réalisée sur une série de clôtures fixée (résultat déterministe attendu), fallback mock si pas de clé ou réponse invalide.
- Suite existante (21 tests) : doit rester verte.

## 9. Découpage en 2 PR

1. **PR A — Données macro réelles** : FRED étendu (VIX, crédit, CPI YoY, T10Y2Y direct), correction du cache Alpha Vantage à 24h, nouveau sous-score crédit, mise à jour Methodology, tests.
2. **PR B — Module actions/ETF** : `equities.ts`, `AssetSignal`, page `/portfolio`, `AssetCard`, `PORTFOLIO_TICKERS` dans `.env.example`, mise à jour Methodology, tests.

## 10. Limites qui resteront vraies après ce v1 (à ne pas oublier)

Même après implémentation : les probabilités "hausse/baisse" façon prévision n'existeront plus (remplacées par des faits), le score macro reste une heuristique non backtestée, et rien ici ne remplace une analyse fondamentale ou un conseil financier réel. Le disclaimer existant sur le site doit rester.

## 11. Mise à jour post-déploiement — watchlist réduite à 3 tickers

Observé en production : le WTI (déjà en place, indépendant de ce module) est repassé en `mock` après plusieurs déploiements rapprochés le même jour. Cause probable : chaque déploiement Vercel peut relancer les fetchs Alpha Vantage à froid, et 3 déploiements × 11 appels (1 WTI + 5 tickers × 2) dépasse largement les 25 requêtes/jour du tier gratuit.

Watchlist par défaut réduite à `SPY,QQQ,VTI` (6 appels + 1 WTI = 7/cycle), pour laisser de la marge lors d'itérations rapprochées. Personnalisable via `PORTFOLIO_TICKERS` en respectant `(n × 2) + 1 ≤ 25`.
