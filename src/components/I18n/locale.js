import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

export function currentLocale() {
  const {
    i18n: { currentLocale }
  } = useDocusaurusContext();

  return currentLocale;
}
