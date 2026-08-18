import type { FixedAccountInput } from '../domain/fixed-account';
import {
  deleteFixedAccount,
  listFixedAccounts,
  saveFixedAccount,
} from '../infrastructure/fixed-account-repository';

export function getFixedAccounts() {
  return listFixedAccounts();
}

export function createFixedAccount(input: FixedAccountInput) {
  return saveFixedAccount(input);
}

export function updateFixedAccount(id: string, input: FixedAccountInput) {
  return saveFixedAccount(input, id);
}

export function removeFixedAccount(id: string) {
  return deleteFixedAccount(id);
}
