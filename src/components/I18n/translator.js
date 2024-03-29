import { currentLocale } from './locale';

export function arg() {
  return TranslatorArg;
}

export function i18n() {
  return new Translator();
}

function TranslatorArg() {}

function Translator() {
  this.translators = [];
}

Translator.prototype.trans = function (original) {
  this.translators.push({
    original,
    translations: []
  });
  return this;
};

Translator.prototype.en = function (translation) {
  appendTranslation(this.translators, 'en', translation);
  return this;
};

Translator.prototype.zh = function (translation) {
  appendTranslation(this.translators, 'zh', translation);
  return this;
};

Translator.prototype.done = function () {
  const translators = this.translators;
  return function _translate_(...texts) {
    // locale 只能在组件函数内调用，故，放在国际化翻译时获取
    return translate(translators, _translate_.locale || currentLocale(), texts);
  };
};

function translate(translators, lang, texts) {
  for (const { original, translations } of translators) {
    const [matched, args] = matching(original, texts);

    if (!matched) {
      continue;
    }

    for (const { locale, translation } of translations) {
      if (locale === lang) {
        if (typeof translation === 'function') {
          return translation.apply(null, args);
        }
        return translation;
      }
    }
    break;
  }

  return texts.join('');
}

function appendTranslation(translators, locale, translation) {
  if (translators.length === 0) {
    return;
  }

  //   {
  //     original: ['abc', arg(), 'def'],
  //     translations: [{ locale: 'en', translation: (a) => 'abc' + a + 'def' }];
  //   }
  translators[translators.length - 1].translations.push({
    locale,
    translation
  });
}

function matching(left, right) {
  if (left.length !== right.length) {
    return [false, []];
  }

  const args = [];
  for (let i = 0; i < left.length; i++) {
    const l = left[i];
    const r = right[i];

    if (l !== r && l !== TranslatorArg) {
      return [false, []];
    }

    if (l === TranslatorArg) {
      args.push(r);
    }
  }

  return [true, args];
}
