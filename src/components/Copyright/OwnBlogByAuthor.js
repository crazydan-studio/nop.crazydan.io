import React from 'react';

import Link from '@docusaurus/Link';
import Admonition from '@theme/Admonition';
import { useLocation } from '@docusaurus/router';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

import i18n from './i18n';

export default function ({ owner }) {
  const {
    siteConfig: { url }
  } = useDocusaurusContext();
  const location = useLocation();
  const link = url + location.pathname;

  return (
    <Admonition type="info" title={i18n('版权声明')}>
      <ul>
        <li>
          {i18n('文章作者')}: {owner.name}
          {' - '}
          <Link to={`mailto:${owner.email}`}>{owner.email}</Link>
        </li>
        <li>
          {i18n('文章链接')}: <Link to={link}>{link}</Link>
        </li>
        <li>
          {i18n('版权声明')}: {i18n('本文章采用许可协议')}
          <Link
            to={i18n('https://creativecommons.org/licenses/by/4.0/deed.zh')}
          >
            {i18n('《署名 4.0 国际 (CC BY 4.0)》')}
          </Link>
          {i18n('，转载或商用请注明文章来源及作者信息。')}
        </li>
      </ul>
    </Admonition>
  );
}
