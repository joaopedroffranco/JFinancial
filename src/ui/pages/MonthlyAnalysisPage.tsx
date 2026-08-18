import { useParams } from 'react-router-dom';

import { Card, Heading, Icon, Text } from '../design-system';
import './monthly-analysis-page.css';

const monthNames: Record<string, string> = {
  janeiro: 'Janeiro', fevereiro: 'Fevereiro', marco: 'Março', abril: 'Abril',
  maio: 'Maio', junho: 'Junho', julho: 'Julho', agosto: 'Agosto',
  setembro: 'Setembro', outubro: 'Outubro', novembro: 'Novembro', dezembro: 'Dezembro',
};

export function MonthlyAnalysisPage() {
  const { month = '', year = '' } = useParams();
  const monthName = monthNames[month] ?? month;

  return (
    <main className="monthly-analysis-page">
      <Text as="span" variant="eyebrow">Análise mensal</Text>
      <Heading as="h1" size="display">{monthName} de {year}</Heading>

      <Card className="monthly-analysis-page__empty" padding="lg">
        <Icon name="calendar" />
        <Heading as="h2" size="small">Nenhuma análise concluída</Heading>
        <Text variant="secondary">
          O fechamento deste mês aparecerá aqui quando o fluxo de análise estiver disponível.
        </Text>
      </Card>
    </main>
  );
}
