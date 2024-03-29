import React from 'react';

import Link from '@docusaurus/Link';
import Admonition from '@theme/Admonition';

import i18n from './i18n';

export default function ({ source, transfer }) {
  return (
    <Admonition type="info" title={i18n('版权声明')}>
      <ul>
        <li>
          {i18n('原文链接')}: <Link to={source.url}>{source.url}</Link>
        </li>
        <li>
          {i18n('原文作者')}: {source.author.name}
          {' - '}
          <Link to={`mailto:${source.author.email}`}>
            {source.author.email}
          </Link>
        </li>
        <li>
          {i18n('转载编者')}: {transfer.name}
          {' - '}
          <Link to={`mailto:${transfer.email}`}>{transfer.email}</Link>
        </li>
        <li>
          {i18n('版权声明')}:{' '}
          {i18n(
            '本转载文章的权益归原文作者所有，再次转载请注明原文来源及原文作者，并声明原文版权！'
          )}
        </li>
      </ul>
    </Admonition>
  );
}
