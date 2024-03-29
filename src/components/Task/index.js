import React from 'react';
import clsx from 'clsx';

import i18n from './i18n';
import styles from './styles.module.css';

export function Tasks({ children }) {
  return (
    <table>
      <thead>
        <tr>
          <th>{i18n('状态')}</th>
          <th>{i18n('开始时间')}</th>
          <th>{i18n('结束时间')}</th>
          <th>{i18n('开发内容')}</th>
          <th>{i18n('备注')}</th>
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  );
}

export function Task({ children, status, startDate, endDate }) {
  const comments = [];
  const contents = [];

  children.forEach((child) => {
    if (child.props.mdxType === 'Comment') {
      comments.push(child);
    } else {
      contents.push(child);
    }
  });

  return (
    <tr className={status === 'discarded' ? clsx(styles.taskDiscarded) : ''}>
      <td>
        <span className={clsx(styles.taskStatus, styles[status])}>
          {renderStatus(status)}
        </span>
      </td>
      <td>{startDate}</td>
      <td>{endDate}</td>
      <td className={clsx(styles.taskContent)}>{contents}</td>
      <td>{comments}</td>
    </tr>
  );
}

export function Comment({ children }) {
  return children || '';
}

function renderStatus(status) {
  switch (status) {
    case 'done':
      return i18n('已完成');
    case 'doing':
      return i18n('进行中');
    case 'pending':
      return i18n('未开始');
    case 'discarded':
      return i18n('已取消');
  }
  return '';
}
