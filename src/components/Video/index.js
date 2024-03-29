import React from 'react';

import Link from '@docusaurus/Link';

import i18n from './i18n';

export default function ({ src, type, source }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <video controls width="100%" height="100%">
        <source src={src} type={`video/${type}`} />
      </video>
      <span style={{ color: 'var(--ifm-blockquote-color)' }}>
        {i18n('注：该视频来自')} <Link to={source.url}>{source.title}</Link>
      </span>
    </div>
  );
}
