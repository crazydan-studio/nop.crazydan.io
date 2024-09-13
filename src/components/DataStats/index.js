import React, { useState, useContext } from 'react';

const Context = React.createContext();
export function DataStats({ children }) {
  const [dataItems, updateDataItems] = useState({});

  return (
    <Context.Provider value={{ dataItems, updateDataItems }}>
      {children}
    </Context.Provider>
  );
}

export function DataItem({ unit, value }) {
  const { dataItems, updateDataItems } = useContext(Context);

  updateDataItems(() => {
    dataItems[unit] = dataItems[unit] || [];
    dataItems[unit].push(value);

    return dataItems;
  });

  return (
    <>
      {value} {unit}
    </>
  );
}

export function DataSum({ unit }) {
  const { dataItems } = useContext(Context);
  const sum = (dataItems[unit] || []).reduce(
    (result, curr) => result + curr,
    0
  );

  return (
    <>
      {sum} {unit}
    </>
  );
}
