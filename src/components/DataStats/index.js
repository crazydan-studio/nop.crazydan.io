import React from 'react';

// Note: 在 SSR 模式中，不能通过 React.createContext 在组件间共享数据，
// 因此，只能递归遍历所有子节点
export function DataStats({ children }) {
  const data = {};
  statsItems(children, data);

  return replaceChild(children, (child) => {
    const props = child.props || {};
    const type = props.originalType;

    if (type === DataSum) {
      const unit = props.unit;
      const value = props.value;
      const sum = (data[unit] || []).reduce((result, curr) => result + curr, 0);

      if (sum !== value) {
        return DataSum({ unit, value: sum });
      }
    }

    return child;
  });
}

export function DataItem({ unit, value }) {
  return (
    <>
      {value} {unit}
    </>
  );
}

export function DataSum({ unit, value = 0 }) {
  return (
    <>
      {value} {unit}
    </>
  );
}

function statsItems(children, data) {
  const items = Array.isArray(children) ? children : [children];

  items.forEach((item) => {
    const props = item.props || {};
    const type = props.originalType;

    if (type === DataItem) {
      const unit = props.unit;
      const value = props.value;

      data[unit] = data[unit] || [];
      data[unit].push(value);
    } else {
      statsItems(props.children || [], data);
    }
  });
}

function replaceChild(children, replace) {
  if (Array.isArray(children)) {
    return children.map((child) => {
      child = replace(child);

      if (child.props && child.props.children) {
        child = {
          ...child,
          props: {
            ...child.props,
            children: replaceChild(child.props.children, replace)
          }
        };
      }

      return child;
    });
  } else {
    return replace(children);
  }
}
