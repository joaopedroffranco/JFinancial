import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { getMonthlyAnalysis, getMonthlyAnalysisTransactions } from '../../application/monthly-analyses';
import type { MonthlyAnalysis } from '../../domain/monthly-analysis';
import type { Transaction } from '../../domain/transaction';
import { formatCurrency } from '../../utils/currency';
import { getMonthName } from '../../utils/date';
import { Card, Heading, Text } from '../design-system';
import './monthly-analysis-page.css';

export function MonthlyAnalysisPage() {
  const { analysisId = '' } = useParams();
  const [analysis, setAnalysis] = useState<MonthlyAnalysis>();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    void Promise.all([
      getMonthlyAnalysis(analysisId),
      getMonthlyAnalysisTransactions(analysisId),
    ]).then(([storedAnalysis, storedTransactions]) => {
      setAnalysis(storedAnalysis);
      setTransactions(storedTransactions);
      setIsLoading(false);
    });
  }, [analysisId]);

  if (isLoading) {
    return <main className="monthly-analysis-page"><Text variant="secondary">Carregando análise…</Text></main>;
  }

  if (!analysis) {
    return <main className="monthly-analysis-page"><Heading as="h1" size="display">Análise não encontrada</Heading></main>;
  }

  const month = Number(analysis.period.slice(5));
  const year = analysis.period.slice(0, 4);
  const credits = transactions.filter(({ direction }) => direction === 'credit')
    .reduce((total, transaction) => total + transaction.amountInCents, 0);
  const debits = transactions.filter(({ direction }) => direction === 'debit')
    .reduce((total, transaction) => total + transaction.amountInCents, 0);

  return (
    <main className="monthly-analysis-page">
      <Text as="span" variant="eyebrow">Análise mensal · Rascunho</Text>
      <Heading as="h1" size="display">{getMonthName(month)} de {year}</Heading>

      <section className="monthly-analysis-page__metrics" aria-label="Resumo importado">
        <Card><Text variant="caption">Movimentações</Text><strong>{transactions.length}</strong></Card>
        <Card><Text variant="caption">Entradas</Text><strong>{formatCurrency(credits)}</strong></Card>
        <Card><Text variant="caption">Saídas</Text><strong>{formatCurrency(debits)}</strong></Card>
      </section>

      <Card className="monthly-analysis-page__pending" padding="lg">
        <Heading as="h2" size="small">Classificação pendente</Heading>
        <Text variant="secondary">
          As movimentações foram preservadas sem inferências financeiras. A próxima etapa será
          revisar transferências, aplicações, receitas e gastos.
        </Text>
      </Card>
    </main>
  );
}
