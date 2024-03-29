import React from 'react';
import clsx from 'clsx';

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import { currentLocale } from '@site/src/components/I18n';

import i18n from './i18n';
import styles from './styles.module.css';

const langNames = {
  zh: '中文',
  en: '英文'
};

export function Text({ children }) {
  return (
    <div className={clsx(styles.translationText)}>
      {children || (
        <p className={clsx(styles.translationWaiting)}>
          {i18n('正在翻译中 ...')}
        </p>
      )}
    </div>
  );
}

export function Translation({ children, titled }) {
  const locale = currentLocale();

  const items = Array.isArray(children) ? children : [children];
  const sourceItem = items.filter((item) => item.props.source)[0];
  const otherItems = items.filter((item) => !item.props.source);
  const sortedItems = sourceItem ? [sourceItem].concat(otherItems) : otherItems;

  const Comp = titled ? TranslationTitle : TranslationParagraph;

  return <Comp locale={locale} source={sourceItem} items={sortedItems} />;
}

function TranslationParagraph({ locale, items }) {
  const hasTranslation = items.reduce(
    (result, { props }) =>
      result ||
      // 已翻译为当前语言
      (locale && locale === props.lang && !!props.children),
    false
  );

  return (
    <div className={clsx(styles.translationContainer)}>
      <Tabs className={clsx(styles.translation)} /*groupId="translation"*/>
        {items.map(({ props, type: TextComp }, idx) => (
          <TabItem
            key={idx}
            value={props.lang}
            label={i18n(
              i18n(langNames[props.lang] || props.lang),
              props.source ? '原文' : ''
            )}
            default={
              items.length === 1
                ? true
                : hasTranslation
                ? locale === props.lang
                : props.source
            }
          >
            <TextComp {...props} />
          </TabItem>
        ))}
      </Tabs>
    </div>
  );
}

function TranslationTitle({ locale, source, items }) {
  const titleId = (source || items[0]).props.children.props.id;

  if (typeof window !== 'undefined') {
    items.forEach((item) => {
      const itemId = item.props.children ? item.props.children.props.id : null;
      if (!itemId || itemId === titleId) {
        return;
      }

      const style = document.createElement('style');
      style.innerText = `.table-of-contents__link[href="#${itemId}"] { display: none; }`;
      document.body.appendChild(style);
    });
  }

  const hasTranslation = items.reduce(
    (result, { props }) =>
      result ||
      // 已翻译为当前语言
      (locale && locale === props.lang && !!props.children),
    false
  );

  return (
    <div
      className={clsx(
        styles.translationContainer,
        styles.translationTitleContainer
      )}
      id={titleId}
    >
      <Tabs className={clsx(styles.translation)} /*groupId="translation"*/>
        {items.map(({ props }, idx) => (
          <TabItem
            key={idx}
            value={props.lang}
            label={i18n(
              i18n(langNames[props.lang] || props.lang),
              props.source ? '原文' : ''
            )}
            default={
              items.length === 1
                ? true
                : hasTranslation
                ? locale === props.lang
                : props.source
            }
          >
            {props.children &&
              []
                .concat(props.children)
                .map(({ props, type: TitleComp }, idx) => (
                  <TitleComp key={idx} {...props} id="">
                    {props.children}
                    <a href={`#${titleId}`} className="hash-link"></a>
                  </TitleComp>
                ))}
          </TabItem>
        ))}
      </Tabs>
    </div>
  );
}
