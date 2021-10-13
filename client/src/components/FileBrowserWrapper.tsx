import React, { ReactElement, useState, useEffect } from 'react';

import { Entry, filebrowser } from 'client/api/filebrowser';
import { makeAuthenticatedRequest } from 'client/store';
import { FileBrowser, ColumnNames } from './FileBrowser';
import { decodeParts, normalize } from 'client/lib/path';
import { SortInfo } from './DataGrid';
import { getHumanReadableSize } from 'client/lib/numberFormat';

type URL = typeof window.URL.prototype;

const getFilebrowserCwd = (url: URL): string => {
  const path = url.pathname.replace(/^\/filebrowser/, '');
  return decodeParts(normalize(`/${path}`));
};

const lexicographicSort = function<T>(a: T, b: T): number {
  if (a > b) {
    return 1;
  }
  if (a < b) {
    return -1;
  }
  return 0;
};

export const FileBrowserWrapper = ({ url }: { url: URL }): ReactElement => {
  const cwd = getFilebrowserCwd(url);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sort, setSort] = useState<SortInfo<ColumnNames>>({
    name: 'name',
    direction: 'ascending',
  });

  useEffect(() => {
    void makeAuthenticatedRequest(async (sessionId) => {
      const entries = await filebrowser({ path: cwd, sessionId });
      setSearchTerm('');
      setEntries(entries);
    });
  }, [url]);

  let entryList = entries;

  if (searchTerm) {
    entryList = entryList.filter((entry) => {
      return (
        entry.name.indexOf(searchTerm) !== -1 ||
        getHumanReadableSize(entry.size).indexOf(searchTerm) !== -1
      );
    });
  }

  entryList.sort(
    (a, b): number => {
      const reverse = sort.direction === 'descending' ? -1 : 1;
      if (sort.name === 'name') {
        return lexicographicSort(a.name, b.name) * reverse;
      }
      if (sort.name === 'size') {
        return (a.size - b.size) * reverse;
      }
      return 0;
    },
  );

  const onSortClick = (name: ColumnNames): void => {
    if (sort.name !== name) {
      setSort({
        name,
        direction: 'ascending',
      });
      return;
    }

    setSort({
      name,
      direction: sort.direction === 'ascending' ? 'descending' : 'ascending',
    });
  };

  return (
    <FileBrowser
      cwd={cwd}
      entryList={entryList}
      sort={sort}
      onSortClick={onSortClick}
      searchTerm={searchTerm}
      onSearchTermChange={setSearchTerm}
    />
  );
};
