const brlFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

export function formatCurrency(amountInCents: number) {
  return brlFormatter.format(amountInCents / 100);
}

export function formatCurrencyInput(amountInCents: number) {
  return (amountInCents / 100).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    useGrouping: false,
  });
}

export function parseCurrencyToCents(value: string) {
  const sanitizedValue = value.trim().replace(/\s|R\$/g, '');
  const normalizedValue = sanitizedValue.includes(',')
    ? sanitizedValue.replace(/\./g, '').replace(',', '.')
    : sanitizedValue;
  const amount = Number(normalizedValue);

  if (!Number.isFinite(amount) || amount < 0) return null;

  return Math.round(amount * 100);
}
