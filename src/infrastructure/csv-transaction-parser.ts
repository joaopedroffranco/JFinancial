import { z } from 'zod';

import type { TransactionInput } from '../domain/transaction';

const externalRowSchema = z.object({
  date: z.string().trim().min(1),
  description: z.string().trim().min(1),
  amount: z.string().trim().min(1),
});

type HeaderAliases = Record<'date' | 'description' | 'amount', readonly string[]>;

const bankStatementHeaderAliases: HeaderAliases = {
  date: ['data', 'date'],
  description: ['descricao', 'description', 'historico', 'memo'],
  amount: ['valor', 'amount'],
} as const;

const creditCardInvoiceHeaderAliases: HeaderAliases = {
  date: ['date'],
  description: ['title'],
  amount: ['amount'],
} as const;

export interface ParsedTransactionFile {
  transactions: TransactionInput[];
}

function normalizeHeader(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
}

function countDelimiter(line: string, delimiter: ',' | ';') {
  let count = 0;
  let quoted = false;

  for (let index = 0; index < line.length; index += 1) {
    if (line[index] === '"') quoted = !quoted;
    else if (!quoted && line[index] === delimiter) count += 1;
  }

  return count;
}

function parseLine(line: string, delimiter: ',' | ';') {
  const values: string[] = [];
  let current = '';
  let quoted = false;

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];

    if (character === '"' && quoted && line[index + 1] === '"') {
      current += '"';
      index += 1;
    } else if (character === '"') {
      quoted = !quoted;
    } else if (character === delimiter && !quoted) {
      values.push(current.trim());
      current = '';
    } else {
      current += character;
    }
  }

  if (quoted) throw new Error('O CSV possui aspas não finalizadas.');
  values.push(current.trim());
  return values;
}

function parseDate(value: string) {
  const isoMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  const localMatch = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);
  const parts = isoMatch
    ? { year: isoMatch[1], month: isoMatch[2], day: isoMatch[3] }
    : localMatch
      ? { year: localMatch[3], month: localMatch[2], day: localMatch[1] }
      : undefined;

  if (!parts) throw new Error(`Data inválida: ${value}.`);

  const isoDate = `${parts.year}-${parts.month}-${parts.day}`;
  const date = new Date(`${isoDate}T00:00:00Z`);
  if (Number.isNaN(date.valueOf()) || date.toISOString().slice(0, 10) !== isoDate) {
    throw new Error(`Data inválida: ${value}.`);
  }

  return isoDate;
}

function parseAmount(value: string) {
  const sanitized = value.replace(/R\$|\s/g, '');
  const negative = sanitized.startsWith('-') || /^\(.+\)$/.test(sanitized);
  const unsigned = sanitized.replace(/[()\-+]/g, '');
  const decimalSeparator = unsigned.lastIndexOf(',') > unsigned.lastIndexOf('.') ? ',' : '.';
  const normalized = decimalSeparator === ','
    ? unsigned.replace(/\./g, '').replace(',', '.')
    : unsigned.replace(/,/g, '');

  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) {
    throw new Error(`Valor inválido: ${value}.`);
  }

  const [integer, decimals = ''] = normalized.split('.');
  const cents = Number(integer) * 100 + Number(decimals.padEnd(2, '0'));
  if (!Number.isSafeInteger(cents) || cents === 0) {
    throw new Error(`Valor inválido: ${value}.`);
  }

  return negative ? -cents : cents;
}

function parseTransactionCsv(
  content: string,
  headerAliases: HeaderAliases,
  expectedColumns: string,
  getDirection: (signedAmount: number) => TransactionInput['direction'],
): ParsedTransactionFile {
  const lines = content.replace(/^\uFEFF/, '').split(/\r?\n/).filter((line) => line.trim());
  if (lines.length < 2) throw new Error('O CSV não contém movimentações.');

  const delimiter = countDelimiter(lines[0], ';') > countDelimiter(lines[0], ',') ? ';' : ',';
  const headers = parseLine(lines[0], delimiter).map(normalizeHeader);
  const indexes = Object.fromEntries(
    Object.entries(headerAliases).map(([field, aliases]) => [
      field,
      headers.findIndex((header) => (aliases as readonly string[]).includes(header)),
    ]),
  ) as Record<keyof typeof headerAliases, number>;

  if (Object.values(indexes).some((index) => index < 0)) {
    throw new Error(`Use um CSV com as colunas ${expectedColumns}.`);
  }

  const transactions = lines.slice(1).map((line, rowIndex) => {
    try {
      const values = parseLine(line, delimiter);
      const row = externalRowSchema.parse({
        date: values[indexes.date],
        description: values[indexes.description],
        amount: values[indexes.amount],
      });
      const signedAmount = parseAmount(row.amount);

      return {
        occurredOn: parseDate(row.date),
        description: row.description,
        amountInCents: Math.abs(signedAmount),
        direction: getDirection(signedAmount),
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'linha inválida';
      throw new Error(`Linha ${rowIndex + 2}: ${message}`);
    }
  });

  return { transactions };
}

export function parseNubankBankStatementCsv(content: string) {
  return parseTransactionCsv(
    content,
    bankStatementHeaderAliases,
    'Data, Descrição e Valor',
    (signedAmount) => signedAmount > 0 ? 'credit' : 'debit',
  );
}

export function parseNubankCreditCardInvoiceCsv(content: string) {
  return parseTransactionCsv(
    content,
    creditCardInvoiceHeaderAliases,
    'date, title e amount',
    (signedAmount) => signedAmount < 0 ? 'credit' : 'debit',
  );
}
