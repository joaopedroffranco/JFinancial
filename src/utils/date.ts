export const monthNames = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
] as const;

export const monthOptions = monthNames.map((label, index) => ({
  label,
  value: String(index + 1),
}));

export interface CalendarPeriod {
  month: number;
  year: number;
}

export function getCalendarPeriod(date: Date): CalendarPeriod {
  return {
    month: date.getMonth() + 1,
    year: date.getFullYear(),
  };
}

export function formatIsoDate(isoDate: string) {
  const [year, month, day] = isoDate.split('-');
  return `${day}/${month}/${year}`;
}

export function getMonthName(month: number) {
  return monthNames[month - 1];
}

export function createYearOptions(
  referenceYear: number,
  previousYears = 5,
  nextYears = 1,
) {
  return Array.from(
    { length: previousYears + nextYears + 1 },
    (_, index) => {
      const year = referenceYear - previousYears + index;
      return { label: String(year), value: String(year) };
    },
  );
}
