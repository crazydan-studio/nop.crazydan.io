import React from 'react';

// https://react-tooltip.com/docs/examples/basic-examples
import { Tooltip } from 'react-tooltip';

import styles from './styles.module.css';

const TOOLTIP_ID = 'code-doc-tooltip';

export function CodeDocs({ children }) {
  children = [].concat(children);

  const docChildren = {};
  children.forEach((child) => {
    const {
      props: { token, originalType }
    } = child;

    if (originalType == Doc && token) {
      docChildren[token] = child;
    }
  });
  const docedTokens = Object.keys(docChildren);

  return (
    <>
      <>
        {children.map(({ props, type: Comp }, idx) => {
          if (props.originalType === Code) {
            props = {
              ...props,
              docedToken: (token) => docedTokens.includes(token)
            };
          }

          return <Comp key={idx} {...props} />;
        })}
      </>
      <Tooltip
        id={TOOLTIP_ID}
        className={styles.tooltip}
        clickable
        noArrow
        place="right"
        delayHide={0}
        render={({ content, activeAnchor }) => {
          // https://react-tooltip.com/docs/examples/render
          const child = docChildren[content];
          if (!child) {
            return null;
          }

          const { props, type: Comp } = child;

          return (
            <div className={styles.codeDoc}>
              <h2 className={styles.codeDocHeader}>
                <a href={props.href}>#{props.token}</a>
              </h2>
              <div className={styles.codeDocBody}>
                <Comp {...props} />
              </div>
            </div>
          );
        }}
      ></Tooltip>
    </>
  );
}

/** 在该标签内部依然使用 markdown 的代码块 */
export function Code({ children, docedToken, ...props }) {
  // Note: 在 ref 函数中更新 token 标记，确保组件每次更新都能够重置该标记
  return (
    <div {...props} ref={($el) => $el && markCodeToken($el, docedToken)}>
      {children}
    </div>
  );
}

/**
 * 文档内部可为任意 Markdown 内容
 *
 * @param {String} token 代码中需显示文档的符号
 */
export function Doc({ token, href, children }) {
  // TODO 在无子组件时，视为外部引用，不做显示，仅占位
  return <>{children}</>;
}

/** 确定 token 节点，并添加 tooltip 标记 */
function markCodeToken($dom, docedToken) {
  const trim = ($el) => $el && ($el.innerText || '').trim();
  const $tokens = $dom.querySelectorAll('.token:not(.punctuation,.comment)');
  const tokenSize = $tokens.length;

  const tokenList = [];
  let token = [];
  for (let i = 0; i < tokenSize; i++) {
    const $token = $tokens[i];
    const $tokenNext = $tokens[i + 1];
    const tokenValue = trim($token);
    const tokenNextValue = trim($tokenNext);

    if (!tokenValue || $token.getAttribute('data-tooltip-id')) {
      continue;
    }
    token.push($token);

    if ($token.nextElementSibling != $tokenNext || !tokenNextValue) {
      tokenList.push(token);

      token = [];
    }
  }

  tokenList.forEach((token) => {
    const tokenValue = token.map((t) => t.innerText).join('');
    if (!docedToken(tokenValue)) {
      return;
    }

    console.info('Token updated', tokenValue);

    const tokenClassName = 'code-doc-token';
    if (token.length > 1) {
      const $first = token[0];
      const $parent = $first.parentElement;

      if ($parent.classList.contains(tokenClassName)) {
        token = [$parent];
      } else {
        const $wrapper = document.createElement('span');
        $parent.insertBefore($wrapper, $first);

        token.forEach(($t) => {
          $t.remove();
          $wrapper.appendChild($t);
        });
        token = [$wrapper];
      }
    }

    token.forEach(($t) => {
      $t.classList.add(tokenClassName);
      $t.setAttribute('data-tooltip-id', TOOLTIP_ID);
      $t.setAttribute('data-tooltip-content', tokenValue);
    });
  });
}
