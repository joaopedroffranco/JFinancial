import { useState, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';

import { createMonthlyAnalysisFromImports } from '../../application/monthly-analyses';
import { createAnalysisPeriod } from '../../domain/monthly-analysis';
import type { ImportKind, TransactionInput } from '../../domain/transaction';
import {
  parseNubankBankStatementCsv,
  parseNubankCreditCardInvoiceCsv,
} from '../../infrastructure/csv-transaction-parser';
import { calculateFileHash } from '../../infrastructure/file-hash';
import { formatCurrency } from '../../utils/currency';
import {
  createYearOptions,
  formatIsoDate,
  getCalendarPeriod,
  monthOptions,
} from '../../utils/date';
import { sortItems } from '../../utils/sorting';
import { Button, Card, Heading, SelectField, Text } from '../design-system';
import './new-analysis-page.css';

interface ImportPreview {
  fileName: string;
  fileHash: string;
  kind: ImportKind;
  transactions: TransactionInput[];
}

const importKindLabels: Record<ImportKind, string> = {
  'bank-statement': 'Extrato Nubank',
  'credit-card-invoice': 'Fatura Nubank',
};

export function NewAnalysisPage() {
  const navigate = useNavigate();
  const [currentPeriod] = useState(() => getCalendarPeriod(new Date()));
  const [month, setMonth] = useState(String(currentPeriod.month));
  const [year, setYear] = useState(String(currentPeriod.year));
  const [previews, setPreviews] = useState<ImportPreview[]>([]);
  const [error, setError] = useState<string>();
  const [isReading, setIsReading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const yearOptions = createYearOptions(currentPeriod.year);

  async function readFiles(
    event: ChangeEvent<HTMLInputElement>,
    kind: ImportKind,
  ) {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) return;

    setError(undefined);
    setIsReading(true);

    try {
      if (files.some((file) => !file.name.toLowerCase().endsWith('.csv'))) {
        throw new Error('Selecione apenas arquivos CSV.');
      }

      const period = createAnalysisPeriod(Number(year), Number(month));
      const newPreviews = await Promise.all(files.map(async (file) => {
        const content = await file.arrayBuffer();
        const decodedContent = new TextDecoder().decode(content);
        const parsed = kind === 'bank-statement'
          ? parseNubankBankStatementCsv(decodedContent)
          : parseNubankCreditCardInvoiceCsv(decodedContent);
        const transactions = parsed.transactions.filter(
          (transaction) => transaction.occurredOn.startsWith(period),
        );

        return {
          fileName: file.name,
          fileHash: await calculateFileHash(content),
          kind,
          transactions,
        };
      }));
      const selectedHashes = new Set(previews.map(({ fileHash }) => fileHash));
      const batchHashes = new Set<string>();

      for (const preview of newPreviews) {
        if (selectedHashes.has(preview.fileHash) || batchHashes.has(preview.fileHash)) {
          throw new Error(`${preview.fileName}: este arquivo já está na seleção.`);
        }
        batchHashes.add(preview.fileHash);
      }

      setPreviews((currentPreviews) => [...currentPreviews, ...newPreviews]);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Não foi possível ler o arquivo.');
    } finally {
      setIsReading(false);
      event.target.value = '';
    }
  }

  async function confirmImport() {
    if (previews.length === 0) return;
    setError(undefined);
    setIsSaving(true);

    try {
      const analysis = await createMonthlyAnalysisFromImports({
        period: createAnalysisPeriod(Number(year), Number(month)),
        imports: previews,
      });
      navigate(`/analises/${analysis.id}`);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Não foi possível salvar a análise.');
    } finally {
      setIsSaving(false);
    }
  }

  const transactions = sortItems(
    previews.flatMap((preview) => preview.transactions.map((transaction) => ({
      ...transaction,
      importKind: preview.kind,
    }))),
    (transaction) => transaction.occurredOn,
    'ascending',
  );
  const credits = transactions
    .filter((transaction) => transaction.direction === 'credit')
    .reduce((total, transaction) => total + transaction.amountInCents, 0);
  const debits = transactions
    .filter((transaction) => transaction.direction === 'debit')
    .reduce((total, transaction) => total + transaction.amountInCents, 0);
  const transactionSections = [
    {
      id: 'bank-statement',
      title: 'Movimentações de débito',
      description: 'Importadas dos extratos Nubank',
      transactions: transactions.filter(
        (transaction) => transaction.importKind === 'bank-statement',
      ),
    },
    {
      id: 'credit-card-invoice',
      title: 'Movimentações de crédito',
      description: 'Importadas das faturas Nubank',
      transactions: transactions.filter(
        (transaction) => transaction.importKind === 'credit-card-invoice',
      ),
    },
  ].filter((section) => section.transactions.length > 0);

  return (
    <main className="new-analysis-page">
      <header>
        <Text as="span" variant="eyebrow">Fechamento mensal</Text>
        <Heading as="h1" size="display">Nova análise</Heading>
        <Text variant="secondary">
          Importe as movimentações do período. Os arquivos originais serão descartados após a leitura.
        </Text>
      </header>

      <Card as="section" className="new-analysis-page__setup" padding="lg">
        <Heading as="h2" size="small">1. Defina o período</Heading>
        <div className="new-analysis-page__period">
          <SelectField
            label="Mês"
            options={monthOptions}
            value={month}
            onChange={(event) => {
              setMonth(event.target.value);
              setPreviews([]);
            }}
          />
          <SelectField
            label="Ano"
            options={yearOptions}
            value={year}
            onChange={(event) => {
              setYear(event.target.value);
              setPreviews([]);
            }}
          />
        </div>

        <div className="new-analysis-page__file-heading">
          <div>
            <Heading as="h2" size="small">2. Importe os extratos</Heading>
            <Text variant="secondary">CSV Nubank com data, descrição e valor das movimentações.</Text>
          </div>
          <label className="new-analysis-page__file-button">
            {isReading ? 'Lendo arquivos…' : 'Adicionar extratos'}
            <input
              accept=".csv,text/csv"
              disabled={isReading || isSaving}
              multiple
              onChange={(event) => readFiles(event, 'bank-statement')}
              type="file"
            />
          </label>
        </div>

        <div className="new-analysis-page__file-heading">
          <div>
            <Heading as="h2" size="small">3. Importe as faturas</Heading>
            <Text variant="secondary">CSV Nubank com as colunas date, title e amount.</Text>
          </div>
          <label className="new-analysis-page__file-button">
            {isReading ? 'Lendo arquivos…' : 'Adicionar faturas'}
            <input
              accept=".csv,text/csv"
              disabled={isReading || isSaving}
              multiple
              onChange={(event) => readFiles(event, 'credit-card-invoice')}
              type="file"
            />
          </label>
        </div>

        {error ? <Text className="new-analysis-page__error">{error}</Text> : null}
      </Card>

      {previews.length > 0 ? (
        <Card as="section" className="new-analysis-page__preview" padding="lg">
          <div className="new-analysis-page__preview-heading">
            <div>
              <Text as="span" variant="eyebrow">Prévia da importação</Text>
              <Heading as="h2" size="small">Arquivos selecionados</Heading>
            </div>
            <Text variant="caption">
              {transactions.length} movimentações em {previews.length} arquivos
            </Text>
          </div>

          <div className="new-analysis-page__files">
            {previews.map((preview) => (
              <div className="new-analysis-page__file" key={preview.fileHash}>
                <div>
                  <strong>{preview.fileName}</strong>
                  <Text variant="caption">{importKindLabels[preview.kind]}</Text>
                  <Text variant="caption">{preview.transactions.length} movimentações</Text>
                </div>
                <Button
                  disabled={isSaving}
                  onClick={() => setPreviews((current) => current.filter(({ fileHash }) => fileHash !== preview.fileHash))}
                  variant="ghost"
                >
                  Remover
                </Button>
              </div>
            ))}
          </div>

          <div className="new-analysis-page__totals">
            <div><Text variant="caption">Entradas</Text><strong>{formatCurrency(credits)}</strong></div>
            <div><Text variant="caption">Saídas</Text><strong>{formatCurrency(debits)}</strong></div>
          </div>

          <div className="new-analysis-page__transaction-sections">
            {transactionSections.map((section) => (
              <section className="new-analysis-page__transaction-section" key={section.id}>
                <div className="new-analysis-page__transaction-heading">
                  <div>
                    <Heading as="h3" size="small">{section.title}</Heading>
                    <Text variant="caption">{section.description}</Text>
                  </div>
                  <Text variant="caption">{section.transactions.length} movimentações</Text>
                </div>

                <div className="new-analysis-page__table-wrapper">
                  <table className="new-analysis-page__table">
                    <thead>
                      <tr>
                        <th>Data</th>
                        <th>Descrição</th>
                        <th>Movimento</th>
                        <th>Valor</th>
                      </tr>
                    </thead>
                    <tbody>
                      {section.transactions.map((transaction, index) => (
                        <tr key={`${transaction.occurredOn}-${transaction.description}-${index}`}>
                          <td>{formatIsoDate(transaction.occurredOn)}</td>
                          <td>{transaction.description}</td>
                          <td>{transaction.direction === 'credit' ? 'Entrada' : 'Saída'}</td>
                          <td className={`new-analysis-page__amount new-analysis-page__amount--${transaction.direction}`}>
                            {transaction.direction === 'debit' ? '− ' : '+ '}
                            {formatCurrency(transaction.amountInCents)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            ))}
          </div>

          <div className="new-analysis-page__actions">
            <Button disabled={isSaving} onClick={() => setPreviews([])} variant="ghost">Limpar arquivos</Button>
            <Button disabled={isSaving} onClick={confirmImport}>
              {isSaving ? 'Salvando…' : 'Confirmar importação'}
            </Button>
          </div>
        </Card>
      ) : null}
    </main>
  );
}
