import { SectionCard } from '@/components/ui/SectionCard';

export default function Methodology() {
  return <div className='space-y-3'>
    <h1 className='text-xl font-semibold'>Methodology</h1>
    <SectionCard title='Ce que mesure le score'>Le score agrège des signaux macro, marché, géopolitiques et crypto pour une lecture synthétique de risque 0–100.</SectionCard>
    <SectionCard title='Lecture des régimes'>
      <table className='w-full text-sm'><tbody>
        <tr><td>0–30</td><td>Risk-on</td></tr>
        <tr><td>30–45</td><td>Normal</td></tr>
        <tr><td>45–60</td><td>Fragile</td></tr>
        <tr><td>60–75</td><td>Stress élevé</td></tr>
        <tr><td>75–100</td><td>Crise</td></tr>
      </tbody></table>
    </SectionCard>
    <SectionCard title='Limites des données gratuites'>Les APIs gratuites peuvent être limitées, retardées, incomplètes, ou indisponibles. Des fallbacks mock sont utilisés pour continuité produit.</SectionCard>
    <SectionCard title='Rôle de Gemini'>Gemini est optionnel et reçoit uniquement un JSON déjà calculé. Si indisponible ou invalide, fallback déterministe local.</SectionCard>
    <SectionCard title='Disclaimer'>Macro Risk Radar est un outil expérimental d’analyse macro-financière. Les scores et probabilités sont indicatifs, ne constituent pas un conseil financier, et peuvent être erronés ou incomplets.</SectionCard>
  </div>;
}
