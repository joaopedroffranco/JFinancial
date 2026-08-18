export type SortDirection = 'ascending' | 'descending';
export type SortValue = string | number;

export function compareSortValues(left: SortValue, right: SortValue) {
  if (typeof left === 'number' && typeof right === 'number') {
    return left - right;
  }

  return String(left).localeCompare(String(right), 'pt-BR', {
    numeric: true,
    sensitivity: 'base',
  });
}

export function sortItems<Item>(
  items: readonly Item[],
  getValue: (item: Item) => SortValue,
  direction: SortDirection,
) {
  const directionMultiplier = direction === 'ascending' ? 1 : -1;

  return items
    .map((item, originalIndex) => ({ item, originalIndex }))
    .sort((left, right) => {
      const comparison = compareSortValues(
        getValue(left.item),
        getValue(right.item),
      );

      return comparison === 0
        ? left.originalIndex - right.originalIndex
        : comparison * directionMultiplier;
    })
    .map(({ item }) => item);
}
