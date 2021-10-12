import React, { ReactElement, ReactNode } from 'react';

export const Link = ({
  to,
  children,
}: {
  to: string;
  children: ReactNode;
}): ReactElement => {
  const onClick = (event: React.SyntheticEvent): void => {
    event.preventDefault();
    window.history.pushState(null, '', to);
    window.dispatchEvent(new window.PopStateEvent('popstate'));
  };

  return (
    <a href={to} onClick={onClick}>
      {children}
    </a>
  );
};
