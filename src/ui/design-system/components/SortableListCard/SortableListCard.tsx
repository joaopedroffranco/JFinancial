import { Fragment, type ReactNode, useMemo, useState } from 'react';

import {
  sortItems,
  type SortDirection,
  type SortValue,
} from '../../../../utils/sorting';
import { Card } from '../Card/Card';
import './sortable-list-card.css';

export interface SortableListColumn<Item> {
  id: string;
  label: string;
  render: (item: Item) => ReactNode;
  sortValue?: (item: Item) => SortValue;
  align?: 'start' | 'end';
  width?: string;
}

export interface SortableListCardProps<Item> {
  ariaLabel: string;
  columns: readonly SortableListColumn<Item>[];
  items: readonly Item[];
  getItemKey: (item: Item) => string;
  emptyMessage?: string;
  expandedItemKey?: string;
  renderExpandedItem?: (item: Item) => ReactNode;
}

interface SortState {
  columnId: string;
  direction: SortDirection;
}

export function SortableListCard<Item>({
  ariaLabel,
  columns,
  emptyMessage = 'Nenhum item cadastrado.',
  expandedItemKey,
  getItemKey,
  items,
  renderExpandedItem,
}: SortableListCardProps<Item>) {
  const [sort, setSort] = useState<SortState>();
  const activeColumn = columns.find((column) => column.id === sort?.columnId);
  const sortedItems = useMemo(() => {
    if (!sort || !activeColumn?.sortValue) return [...items];
    return sortItems(items, activeColumn.sortValue, sort.direction);
  }, [activeColumn, items, sort]);

  function toggleSort(column: SortableListColumn<Item>) {
    if (!column.sortValue) return;

    setSort((currentSort) => ({
      columnId: column.id,
      direction:
        currentSort?.columnId === column.id &&
        currentSort.direction === 'ascending'
          ? 'descending'
          : 'ascending',
    }));
  }

  return (
    <Card as="section" className="ds-sortable-list-card" padding="none">
      <div className="ds-sortable-list-card__scroll">
        <table aria-label={ariaLabel}>
          <colgroup>
            {columns.map((column) => (
              <col key={column.id} style={{ width: column.width }} />
            ))}
          </colgroup>
          <thead>
            <tr>
              {columns.map((column) => {
                const isActive = sort?.columnId === column.id;
                return (
                  <th
                    aria-sort={isActive ? sort.direction : undefined}
                    className={`ds-sortable-list-card__cell--${column.align ?? 'start'}`}
                    key={column.id}
                    scope="col"
                  >
                    {column.sortValue ? (
                      <button onClick={() => toggleSort(column)} type="button">
                        {column.label}
                        <span aria-hidden="true">
                          {isActive
                            ? sort.direction === 'ascending' ? '↑' : '↓'
                            : '↕'}
                        </span>
                      </button>
                    ) : (
                      column.label
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {sortedItems.length === 0 ? (
              <tr>
                <td className="ds-sortable-list-card__empty" colSpan={columns.length}>
                  {emptyMessage}
                </td>
              </tr>
            ) : null}
            {sortedItems.map((item) => {
              const itemKey = getItemKey(item);
              const isExpanded = itemKey === expandedItemKey;

              return (
                <Fragment key={itemKey}>
                  {!isExpanded ? (
                    <tr>
                      {columns.map((column) => (
                        <td
                          className={`ds-sortable-list-card__cell--${column.align ?? 'start'}`}
                          key={column.id}
                        >
                          {column.render(item)}
                        </td>
                      ))}
                    </tr>
                  ) : null}
                  {isExpanded && renderExpandedItem ? (
                    <tr className="ds-sortable-list-card__expanded-row">
                      <td colSpan={columns.length}>{renderExpandedItem(item)}</td>
                    </tr>
                  ) : null}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
