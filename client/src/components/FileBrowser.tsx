import { Entry } from 'client/api/filebrowser';
import { getHumanReadableSize } from 'client/lib/numberFormat';
import { encodeParts, normalize } from 'client/lib/path';
import { Link } from 'client/router/Link';
import React, { ReactElement, ReactNode } from 'react';
import { Breadcrumbs } from './Breadcrumbs';
import { DataGrid, SortInfo } from './DataGrid';
import { Highlighted } from './Highlighted';

const columns = [
  {
    name: 'name' as const,
    title: 'Name',
  },
  {
    name: 'size' as const,
    title: 'Size',
  },
];

export type ColumnNames = (typeof columns)[0]['name'];

const directoryIcon = (
  <svg
    className="directoryIcon"
    aria-label="Directory"
    aria-hidden="true"
    height="16"
    viewBox="0 0 16 16"
    version="1.1"
    width="16"
  >
    <path
      fill-rule="evenodd"
      d="M1.75 1A1.75 1.75 0 000 2.75v10.5C0 14.216.784 15 1.75 15h12.5A1.75 1.75 0 0016 13.25v-8.5A1.75 1.75 0 0014.25 3h-6.5a.25.25 0 01-.2-.1l-.9-1.2c-.33-.44-.85-.7-1.4-.7h-3.5z"
    />
  </svg>
);

const fileIcon = (
  <svg
    className="fileIcon"
    aria-label="File"
    aria-hidden="true"
    height="16"
    viewBox="0 0 16 16"
    version="1.1"
    width="16"
  >
    <path
      fill-rule="evenodd"
      d="M3.75 1.5a.25.25 0 00-.25.25v11.5c0 .138.112.25.25.25h8.5a.25.25 0 00.25-.25V6H9.75A1.75 1.75 0 018 4.25V1.5H3.75zm5.75.56v2.19c0 .138.112.25.25.25h2.19L9.5 2.06zM2 1.75C2 .784 2.784 0 3.75 0h5.086c.464 0 .909.184 1.237.513l3.414 3.414c.329.328.513.773.513 1.237v8.086A1.75 1.75 0 0112.25 15h-8.5A1.75 1.75 0 012 13.25V1.75z"
    />
  </svg>
);

export const FileBrowser = function({
  cwd,
  entryList,
  sort,
  onSortClick,
  searchTerm,
  onSearchTermChange,
}: {
  cwd: string;
  entryList: Entry[];
  sort: SortInfo<ColumnNames>;
  onSortClick: (name: ColumnNames) => void;
  searchTerm: string;
  onSearchTermChange: (term: string) => void;
}): ReactElement {
  const renderEntryName = (entry: Entry): ReactNode => {
    const name = <Highlighted text={entry.name} term={searchTerm} />;
    if (entry.type === 'directory') {
      let path = normalize(`/filebrowser/${cwd}/${entry.name}`);
      path = encodeParts(path);
      return [directoryIcon, <Link to={path}>{name}</Link>];
    }
    return [fileIcon, name];
  };

  const data = entryList.map((entry) => {
    return {
      name: renderEntryName(entry),
      size: (
        <Highlighted
          text={getHumanReadableSize(entry.size)}
          term={searchTerm}
        />
      ),
    };
  });

  return (
    <div className="FileBrowser">
      <Breadcrumbs cwd={cwd} linkPrefix={'/filebrowser'} />
      <input
        className="FileBrowserSearch"
        type="text"
        placeholder="Search"
        onChange={(e): void => onSearchTermChange(e.target.value)}
        value={searchTerm}
      />
      <DataGrid
        columns={columns}
        data={data}
        sort={sort}
        onSortClick={onSortClick}
      />
    </div>
  );
};
