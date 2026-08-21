import {
  monthlyAnalysisSchema,
  type MonthlyAnalysis,
} from '../domain/monthly-analysis';
import {
  importRecordSchema,
  transactionSchema,
  type ImportRecord,
  type Transaction,
} from '../domain/transaction';
import { database } from './database';

export function listMonthlyAnalyses() {
  return database.monthlyAnalyses.orderBy('period').reverse().toArray();
}

export function findMonthlyAnalysisByPeriod(period: string) {
  return database.monthlyAnalyses.where('period').equals(period).first();
}

export function findMonthlyAnalysis(id: string) {
  return database.monthlyAnalyses.get(id);
}

export function listAnalysisTransactions(analysisId: string) {
  return database.transactions.where('analysisId').equals(analysisId).sortBy('occurredOn');
}

export function findImportByHash(fileHash: string) {
  return database.importRecords.where('fileHash').equals(fileHash).first();
}

export async function saveImportedAnalysis(
  analysis: MonthlyAnalysis,
  importRecords: ImportRecord[],
  transactions: Transaction[],
) {
  monthlyAnalysisSchema.parse(analysis);
  importRecords.forEach((importRecord) => importRecordSchema.parse(importRecord));
  transactions.forEach((transaction) => transactionSchema.parse(transaction));

  await database.transaction(
    'rw',
    [database.monthlyAnalyses, database.importRecords, database.transactions],
    async () => {
      await database.monthlyAnalyses.add(analysis);
      await database.importRecords.bulkAdd(importRecords);
      await database.transactions.bulkAdd(transactions);
    },
  );
}
