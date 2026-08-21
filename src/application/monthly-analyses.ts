import type { MonthlyAnalysis } from '../domain/monthly-analysis';
import type {
  ImportKind,
  ImportRecord,
  Transaction,
  TransactionInput,
} from '../domain/transaction';
import {
  findImportByHash,
  findMonthlyAnalysis,
  findMonthlyAnalysisByPeriod,
  listAnalysisTransactions,
  listMonthlyAnalyses,
  saveImportedAnalysis,
} from '../infrastructure/monthly-analysis-repository';

export function getMonthlyAnalyses() {
  return listMonthlyAnalyses();
}

export function getMonthlyAnalysis(id: string) {
  return findMonthlyAnalysis(id);
}

export function getMonthlyAnalysisTransactions(analysisId: string) {
  return listAnalysisTransactions(analysisId);
}

export interface AnalysisFileImport {
  fileName: string;
  fileHash: string;
  kind: ImportKind;
  transactions: TransactionInput[];
}

export async function createMonthlyAnalysisFromImports(input: {
  period: string;
  imports: AnalysisFileImport[];
}) {
  if (input.imports.length === 0) {
    throw new Error('Selecione ao menos um arquivo.');
  }

  const uniqueHashes = new Set(input.imports.map(({ fileHash }) => fileHash));
  if (uniqueHashes.size !== input.imports.length) {
    throw new Error('A seleção contém arquivos duplicados.');
  }

  const existingImports = await Promise.all(
    input.imports.map(({ fileHash }) => findImportByHash(fileHash)),
  );
  if (existingImports.some(Boolean)) {
    throw new Error('Um dos arquivos selecionados já foi importado.');
  }
  if (await findMonthlyAnalysisByPeriod(input.period)) {
    throw new Error('Já existe uma análise para este período.');
  }

  const analysisId = crypto.randomUUID();
  const createdAt = new Date().toISOString();
  const analysis: MonthlyAnalysis = {
    id: analysisId,
    period: input.period,
    status: 'draft',
    createdAt,
  };
  const importRecords: ImportRecord[] = [];
  const transactions: Transaction[] = [];

  input.imports.forEach((fileImport) => {
    const importId = crypto.randomUUID();
    importRecords.push({
      id: importId,
      analysisId,
      fileName: fileImport.fileName,
      fileHash: fileImport.fileHash,
      kind: fileImport.kind,
      importedAt: createdAt,
      transactionCount: fileImport.transactions.length,
    });
    transactions.push(...fileImport.transactions.map((transaction) => ({
      ...transaction,
      id: crypto.randomUUID(),
      analysisId,
      importId,
      classificationStatus: 'pending' as const,
    })));
  });

  await saveImportedAnalysis(analysis, importRecords, transactions);
  return analysis;
}
