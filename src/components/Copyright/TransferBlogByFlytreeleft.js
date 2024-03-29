import React from 'react';

import TransferBlog from './TransferBlog';

export default function ({ source }) {
  return (
    <TransferBlog
      source={source}
      transfer={{ name: 'flytreeleft', email: 'flytreeleft@crazydan.org' }}
    />
  );
}
