import React from 'react';
import clsx from 'clsx';
import Layout from '@theme/Layout';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import useBaseUrl from '@docusaurus/useBaseUrl';

import styles from './styles.module.css';

// Note: 本页面由 DeepSeek 按照 /static/img/xlang-theory.svg 生成
// https://gitee.com/canonical-entropy/nop-entropy/raw/master/docs/theory/xlang-review/xlang-theory.svg
export default function Home() {
  const { siteConfig } = useDocusaurusContext();

  return (
    <Layout title="让演化可编程" description="XLang 与可逆计算的结构化范式">
      <div className={styles.heroContainer}>
        <div className={styles.backgroundGradient}></div>

        {/* 装饰性几何图形 */}
        <div className={styles.decorationCircle1}></div>
        <div className={styles.decorationCircle2}></div>
        <div className={styles.decorationPolygon}></div>

        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>让演化可编程</h1>
          <p className={styles.heroSubtitle}>XLang 与可逆计算的结构化范式</p>

          {/* 核心公式卡片 */}
          <div className={styles.formulaCard}>
            <code className={styles.formula}>
              App = Delta <span className={styles.xExtends}>x-extends</span>{' '}
              Generator&lt;DSL&gt;
            </code>
          </div>

          {/* 三个核心概念卡片 */}
          <div className={styles.cardsContainer}>
            {/* DSL 卡片 */}
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <div className={`${styles.cardIcon} ${styles.dslIcon}`}>
                  <span>🗂</span>
                </div>
                <div>
                  <h3 className={styles.cardTitle}>DSL 图册</h3>
                  <p className={styles.cardSubtitle}>领域坐标系</p>
                </div>
              </div>
              <div className={styles.cardContent}>
                <ul className={styles.featureList}>
                  <li>统一元模型定义</li>
                  <li>XPath 稳定路径</li>
                  <li>跨 DSL 协同</li>
                </ul>
                <div className={styles.codeExample}>
                  /orm/entity[@name='User']/column[@name='id']
                </div>
              </div>
            </div>

            {/* Delta 卡片 */}
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <div className={`${styles.cardIcon} ${styles.deltaIcon}`}>
                  <span>⚡</span>
                </div>
                <div>
                  <h3 className={styles.cardTitle}>Delta 差量</h3>
                  <p className={styles.cardSubtitle}>可逆演化单元</p>
                </div>
              </div>
              <div className={styles.cardContent}>
                <ul className={styles.featureList}>
                  <li>删除语义支持</li>
                  <li>满足结合律</li>
                  <li>可组合复用</li>
                </ul>
                <div className={styles.mathExample}>
                  (A ⊕ B) ⊕ C = A ⊕ (B ⊕ C)
                </div>
              </div>
            </div>

            {/* Generator 卡片 */}
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <div className={`${styles.cardIcon} ${styles.generatorIcon}`}>
                  <span>⚙️</span>
                </div>
                <div>
                  <h3 className={styles.cardTitle}>Generator</h3>
                  <p className={styles.cardSubtitle}>编译期生成引擎</p>
                </div>
              </div>
              <div className={styles.cardContent}>
                <ul className={styles.featureList}>
                  <li>多阶段编译</li>
                  <li>结构化生成</li>
                  <li>源码可追溯</li>
                </ul>
                <div className={styles.toolsContainer}>
                  <span className={styles.tool}>
                    <a
                      href={useBaseUrl('/docs/manual/xlang/xdef')}
                      target="_blank"
                    >
                      XDef
                    </a>
                  </span>
                  <span className={styles.tool}>
                    <a
                      href={useBaseUrl('/docs/manual/xlang/xpl')}
                      target="_blank"
                    >
                      Xpl
                    </a>
                  </span>
                  <span className={styles.tool}>XScript</span>
                </div>
              </div>
            </div>
          </div>

          {/* 底部亮点 */}
          <div className={styles.footerHighlight}>
            <p className={styles.footerText}>
              从句法范式到结构空间构造规则的根本性重构
            </p>
            <p className={styles.footerSubtext}>
              Map → Tree 升维 · 删除语义回归 · 编译期元编程
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
