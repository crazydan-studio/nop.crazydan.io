import { i18n, arg } from '@site/src/components/I18n';

export default i18n()
  //
  .trans(['中文'])
  .en('Chinese')
  //
  .trans(['英文'])
  .en('English')
  //
  .trans(['正在翻译中 ...'])
  .en('Waiting to be translated ...')
  //
  .trans([arg(), '原文'])
  .en((name) => `Source (${name})`)
  .zh((name) => `原文 (${name})`)
  //
  .done();
