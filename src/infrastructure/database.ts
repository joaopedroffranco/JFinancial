import Dexie, { type EntityTable } from 'dexie';

import type { FixedAccount } from '../domain/fixed-account';

class LocalDatabase extends Dexie {
  fixedAccounts!: EntityTable<FixedAccount, 'id'>;

  constructor() {
    super('jfinancial');
    this.version(1).stores({
      fixedAccounts: 'id, name, category',
    });
  }
}

export const database = new LocalDatabase();
