import Dexie, { type EntityTable } from 'dexie';

import type { FixedAccount } from '../domain/fixed-account';
import type { MonthlyAnalysis } from '../domain/monthly-analysis';
import type { ImportRecord, Transaction } from '../domain/transaction';

class LocalDatabase extends Dexie {
  fixedAccounts!: EntityTable<FixedAccount, 'id'>;
  monthlyAnalyses!: EntityTable<MonthlyAnalysis, 'id'>;
  importRecords!: EntityTable<ImportRecord, 'id'>;
  transactions!: EntityTable<Transaction, 'id'>;

  constructor() {
    super('jfinancial');
    this.version(1).stores({
      fixedAccounts: 'id, name, category',
    });
    this.version(2).stores({
      fixedAccounts: 'id, name, category',
      monthlyAnalyses: 'id, &period, createdAt',
      importRecords: 'id, analysisId, &fileHash, importedAt',
      transactions: 'id, analysisId, importId, occurredOn, classificationStatus',
    });
    this.version(3)
      .stores({
        fixedAccounts: 'id, name, category',
        monthlyAnalyses: 'id, &period, createdAt',
        importRecords: 'id, analysisId, &fileHash, kind, importedAt',
        transactions: 'id, analysisId, importId, occurredOn, classificationStatus',
      })
      .upgrade(async (transaction) => {
        await transaction.table('importRecords').toCollection().modify((record) => {
          if (!record.kind) record.kind = 'bank-statement';
        });
      });
  }
}

export const database = new LocalDatabase();
