import React, { ReactElement, ReactNode } from 'react';

export type ColumnDefinition<K extends string> = {
  name: K;
  title: string;
};

export type SortInfo<K extends string> = {
  name: K;
  direction: 'ascending' | 'descending';
};

export const DataGrid = function<K extends string>({
  columns,
  data,
  sort,
  onSortClick,
}: {
  columns: ColumnDefinition<K>[];
  data: Record<K, ReactNode>[];
  sort: SortInfo<K>;
  onSortClick: (name: K) => void;
}): ReactElement {
  return (
    <table className="DataGrid">
      <thead>
        <tr>
          {columns.map((col) => {
            return (
              <td>
                <button onClick={(): void => onSortClick(col.name)}>
                  <div className="columnTitle">{col.title}</div>
                  <div className="sortIndicator">
                    {sort && sort.name === col.name
                      ? sort.direction === 'ascending'
                        ? '▲'
                        : '▼'
                      : ''}
                  </div>
                </button>
              </td>
            );
          })}
        </tr>
      </thead>
      <tbody>
        {data.map((row) => {
          return (
            <tr>
              {columns.map((col) => {
                const name = col.name;
                const val = row[name];
                return <td>{val}</td>;
              })}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};
