import React from 'react';

import Admonition from '@theme/Admonition';
import { useDoc } from '@docusaurus/theme-common/internal';

import i18n from './i18n';

export default function () {
  const { frontMatter } = useDoc();

  return frontMatter.asDraft ? (
    <Admonition type="warning" title={i18n('warning.title')}>
      <span>{i18n('warning.content')}</span>
    </Admonition>
  ) : (
    <></>
  );
}
