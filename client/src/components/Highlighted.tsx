import React, { ReactElement } from 'react';

export const Highlighted = ({
  text,
  term,
}: {
  text: string;
  term: string;
}): ReactElement => {
  if (!term) {
    return <span>{text}</span>;
  }
  const i = text.indexOf(term);
  if (i === -1) {
    return <span>{text}</span>;
  }
  return (
    <span>
      {text.slice(0, i)}
      <strong>{text.slice(i, i + term.length)}</strong>
      {text.slice(i + term.length)}
    </span>
  );
};
