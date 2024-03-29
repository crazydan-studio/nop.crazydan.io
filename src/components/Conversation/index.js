import React from 'react';
import clsx from 'clsx';

import useBaseUrl from '@docusaurus/useBaseUrl';
import Admonition from '@theme/Admonition';
import { currentLocale } from '@site/src/components/I18n';

import i18n from './i18n';
import styles from './styles.module.css';

export function Conversation({ children, asker, replier }) {
  const locale = currentLocale();

  const items = Array.isArray(children) ? children : [children];

  return (
    <div className={clsx(styles.conversation)}>
      {items.map(({ props, type: Comp }, idx) => (
        <Comp
          key={idx}
          user={
            props.mdxType === 'Ask'
              ? asker
              : props.mdxType === 'Reply'
              ? replier
              : null
          }
          {...props}
        >
          {props.children}
        </Comp>
      ))}
    </div>
  );
}

export function Ask({ children, user = {} }) {
  return (
    <div className={clsx(styles.conversationAsk)}>
      <div className={clsx(styles.conversationAskContent)}>{children}</div>
      <div className={clsx(styles.conversationUser)}>
        <img
          className={clsx(styles.conversationUserImg)}
          src={useBaseUrl(user.img)}
        />
        <span className={clsx(styles.conversationUserName)}>{user.name}</span>
      </div>
    </div>
  );
}

export function Reply({ children, user = {} }) {
  return (
    <div className={clsx(styles.conversationReply)}>
      <div className={clsx(styles.conversationUser)}>
        <img
          className={clsx(styles.conversationUserImg)}
          src={useBaseUrl(user.img)}
        />
        <span className={clsx(styles.conversationUserName)}>{user.name}</span>
      </div>
      <div className={clsx(styles.conversationReplyContent)}>{children}</div>
    </div>
  );
}

export function Note({ children }) {
  return (
    <div className={clsx(styles.conversationNote)}>
      <Admonition type="tip" title={i18n('备注')}>
        {children}
      </Admonition>
    </div>
  );
}
