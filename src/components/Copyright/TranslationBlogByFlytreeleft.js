import React from 'react';

import i18n from './i18n';
import TranslationBlog from './TranslationBlog';

export function Declaration() {
  return (
    <blockquote>
      <p>{i18n('本译文采用与原文相同的许可协议进行授权和传播。')}</p>
      <p>
        {i18n(
          '本译文不会对原文做任何除格式调整和拼写错误以外的调整和修改，以确保原文内容的完整性，保证原文所要阐述的事实和思想不被曲解。'
        )}
      </p>
    </blockquote>
  );
}

export default function ({ source, ...props }) {
  return (
    <TranslationBlog
      source={source}
      translator={{ name: 'flytreeleft', email: 'flytreeleft@crazydan.org' }}
      {...props}
    />
  );
}
