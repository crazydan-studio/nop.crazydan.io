import React from 'react';
import clsx from 'clsx';

import styles from './styles.module.css';

export function Table({ children, head }) {
  return (
    <table>
      <thead>
        <tr>
          {head.map((name) => {
            return <th>{name}</th>;
          })}
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  );
}

export function TRow({ children }) {
  const desc = [];
  const other = [];
  [].concat(children).forEach((child) => {
    if (child.props.mdxType === 'TDesc') {
      desc.push(child);
    } else {
      other.push(child);
    }
  });

  return (
    <>
      <tr>{other}</tr>
      {desc.length > 0 && (
        <tr className={clsx(styles.tableRowDesc)}>
          <td colSpan={other.length} className={clsx(styles.tableCellDesc)}>
            {desc}
          </td>
        </tr>
      )}
    </>
  );
}

export function TCol({ children, id }) {
  return (
    <td
      id={id}
      className={clsx(styles.tableColumn, id && styles.tableCellWithId)}
    >
      {id && (
        <a
          href={'#' + id}
          className={clsx(styles.tableCellHashLink, 'hash-link')}
        ></a>
      )}
      {children}
    </td>
  );
}

export function TDesc({ children }) {
  return <>{children}</>;
}
