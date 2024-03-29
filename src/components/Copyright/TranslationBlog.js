import React from 'react';

import Link from '@docusaurus/Link';
import Admonition from '@theme/Admonition';

import i18n from './i18n';

const licenses = {
  'CC BY 4.0': {
    name: '署名 4.0 国际 (CC BY 4.0)',
    url: 'https://creativecommons.org/licenses/by/4.0/deed.zh'
  },
  'CC BY-NC-SA 4.0': {
    name: '署名-非商业性使用-相同方式共享 4.0 国际 (CC BY-NC-SA 4.0)',
    url: 'https://creativecommons.org/licenses/by-nc-sa/4.0/deed.zh'
  }
};

export default function ({ source, translator, license }) {
  const licenseObj = licenses[license];

  return (
    <Admonition type="info" title={i18n('版权声明')}>
      <ul>
        <li>
          {i18n('原文链接')}: <Link to={source.url}>{source.url}</Link>
        </li>
        <li>
          {i18n('原文作者')}: {source.author.name}
          {source.author.email && ' - '}
          {source.author.email && (
            <Link to={`mailto:${source.author.email}`}>
              {source.author.email}
            </Link>
          )}
        </li>
        <li>
          {i18n('译文作者')}: {translator.name}
          {' - '}
          <Link to={`mailto:${translator.email}`}>{translator.email}</Link>
        </li>
        <li>
          {i18n('版权声明')}: {i18n('本译文采用许可协议')}{' '}
          <Link to={licenseObj.url}>{i18n(licenseObj.name)}</Link>
          {source.notLicensed &&
            i18n('（原文未声明许可协议，原文最终解释权归原作者所有）')}
          {i18n('。')} {i18n('转载请注明来自')}{' '}
          <Link to="https://studio.crazydan.org/">Crazydan Studio</Link>
          {i18n('！')}
        </li>
      </ul>
    </Admonition>
  );
}
