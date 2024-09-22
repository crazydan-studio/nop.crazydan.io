import React from 'react';

const ctx = 'https://gitee.com/canonical-entropy/nop-entropy/blob/master';

export function NopLink({ title, path }) {
  return (
    <a href={ctx + encodeURI(path)} target="_blank" rel="noopener noreferrer">
      {title}
    </a>
  );
}

// [Xpl](${ctx}/docs/dev-guide/xlang/xpl.md)
export function NopDocLink({ title, path }) {
  return <NopLink title={title} path={'/docs' + path} />;
}

// [/nop/schema/xmeta.xdef](${ctx}/nop-xdefs/src/main/resources/_vfs/nop/schema/xmeta.xdef)
export function NopVfsLink({ title, module, path }) {
  return (
    <NopLink
      title={title || path}
      path={'/' + module + '/src/main/resources/_vfs' + path}
    />
  );
}
