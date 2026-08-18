import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { getFixedAccounts } from '../../application/fixed-accounts';
import {
  calculateExpectedMonthlyTotal,
  calculateExpectedTotalsByCategory,
  type FixedAccount,
} from '../../domain/fixed-account';
import { formatCurrency } from '../../utils/currency';
import { Card, Heading, Icon, Text } from '../design-system';
import './home-page.css';

export function HomePage() {
  const [accounts, setAccounts] = useState<FixedAccount[]>([]);

  useEffect(() => {
    void getFixedAccounts().then(setAccounts);
  }, []);

  const total = calculateExpectedMonthlyTotal(accounts);
  const totalsByCategory = calculateExpectedTotalsByCategory(accounts);
  const largestCategory = totalsByCategory[0];

  return (
    <main className="home-page">
      <section className="home-page__heading" aria-labelledby="home-title">
        <Text as="span" variant="eyebrow">Visão geral</Text>
        <Heading as="h1" id="home-title" size="display">Olá, João.</Heading>
        <Text className="home-page__description" variant="secondary">
          Uma visão rápida do seu planejamento financeiro neste dispositivo.
        </Text>
      </section>

      <section className="home-page__metrics" aria-label="Resumo das contas fixas">
        <Card className="home-page__metric">
          <Text as="span" variant="caption">Total mensal previsto</Text>
          <strong>{formatCurrency(total)}</strong>
        </Card>
        <Card className="home-page__metric">
          <Text as="span" variant="caption">Contas cadastradas</Text>
          <strong>{accounts.length}</strong>
        </Card>
        <Card className="home-page__metric">
          <Text as="span" variant="caption">Maior categoria</Text>
          <strong>{largestCategory?.category ?? '—'}</strong>
          {largestCategory ? (
            <Text as="small" variant="caption">
              {formatCurrency(largestCategory.expectedAmountInCents)}
            </Text>
          ) : null}
        </Card>
      </section>

      <Card as="section" className="home-page__distribution" padding="lg">
        <div className="home-page__section-heading">
          <div>
            <Heading as="h2" size="small">Distribuição mensal</Heading>
            <Text variant="secondary">Valores previstos por categoria</Text>
          </div>
          <Link className="home-page__link" to="/contas-fixas">
            Gerenciar contas fixas
          </Link>
        </div>

        <div className="home-page__categories">
          {totalsByCategory.map((categoryTotal) => {
            const percentage = total > 0
              ? (categoryTotal.expectedAmountInCents / total) * 100
              : 0;

            return (
              <div className="home-page__category" key={categoryTotal.category}>
                <div className="home-page__category-heading">
                  <Text as="span">{categoryTotal.category}</Text>
                  <strong>{formatCurrency(categoryTotal.expectedAmountInCents)}</strong>
                </div>
                <div className="home-page__category-track" aria-hidden="true">
                  <span style={{ width: `${percentage}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <Card className="home-page__empty-state" padding="lg">
        <span className="home-page__empty-icon" aria-hidden="true">
          <Icon name="calendar" />
        </span>
        <div>
          <Heading as="h2" size="medium">Seu primeiro fechamento começa aqui</Heading>
          <Text className="home-page__empty-description" variant="secondary">
            Quando uma análise mensal for concluída, a mais recente aparecerá nesta página.
            Os meses concluídos ficarão disponíveis no menu lateral para consulta.
          </Text>
        </div>
      </Card>

      <Text className="home-page__privacy" variant="caption">
        Seus dados ficam armazenados somente neste dispositivo.
      </Text>
    </main>
  );
}
