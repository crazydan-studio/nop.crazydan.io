import React from 'react';

import Link from '@docusaurus/Link';
import Admonition from '@theme/Admonition';
import BrowserOnly from '@docusaurus/BrowserOnly';

import i18n from './i18n';

export default function ({ owner }) {
  return (
    <Admonition type="info" title={i18n('版权声明')}>
      <ul>
        <li>
          {i18n('文章作者')}: {owner.name}
          {' - '}
          <Link to={`mailto:${owner.email}`}>{owner.email}</Link>
        </li>
        <li>
          {i18n('版权声明')}: {i18n('本文章采用许可协议')}{' '}
          <Link
            to={i18n('https://creativecommons.org/licenses/by/4.0/deed.zh')}
          >
            {i18n('署名 4.0 国际 (CC BY 4.0)')}
          </Link>
          {i18n('，转载请注明文章来源 ')}{' '}
          <BrowserOnly>
            {() => {
              const location = window.location;
              const link = location.origin + location.pathname;

              return <Link to={link}>{link}</Link>;
            }}
          </BrowserOnly>
        </li>
      </ul>
    </Admonition>
  );
}
