import React, { ReactElement, ReactNode } from 'react';
import { Link } from 'client/router/Link';
import { encodeParts, normalize } from 'client/lib/path';

export const Breadcrumbs = ({
  cwd,
  linkPrefix,
}: {
  cwd: string;
  linkPrefix: string;
}): ReactElement => {
  let parts: string[] = cwd.split('/');
  if (cwd === '/') {
    parts = [''];
  }

  return (
    <div className="Breadcrumbs">
      {parts.map(
        (part, i): ReactNode => {
          let name = part;
          if (i === 0) {
            name = 'root';
          }
          // the last path component shouldn't be a Link (you're already on the
          // route it would link to)
          if (i === parts.length - 1) {
            return [<div className="pathPart">{name}</div>];
          }
          let path = parts.slice(0, i + 1).join('/');
          path = normalize(`${linkPrefix}/${path}`);
          path = encodeParts(path);
          return [
            <div className="pathPart">
              <Link to={path}>{name}</Link>
            </div>,
            <div className="pathSeparator">/</div>,
          ];
        },
      )}
    </div>
  );
};
