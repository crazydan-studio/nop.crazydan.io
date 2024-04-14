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
  return <tr>{children}</tr>;
}

export function TCol({ children, id }) {
  return (
    <td id={id} className={clsx(styles.tableColumn)}>
      {children}
      {id && <a href={'#' + id} class="hash-link"></a>}
    </td>
  );
}
