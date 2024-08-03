---
title: Nop 平台参考手册
description: 有关 Nop 内置数据和函数的使用参考信息
authors:
  - flytreleft
---

import {Table, TRow, TCol, TDesc} from '@site/src/components/Table';
import Header from '@site/docs/\_header.md';

<Header />

## Xpl 上下文内置变量 {#xpl-vars}

<Table head={['变量/函数', '变量名称', '（返回）值类型', '使用范围']}>

<!-- -->

<TRow><TCol id="xpl-var-location"> location() </TCol>

<TCol> 当前执行代码所在的位置信息 </TCol><TCol>

`SourceLocation`

</TCol><TCol>

- 可在 Xpl 脚本内的任意位置调用

</TCol><TDesc>

- 调用 `SourceLocation#getPath()` 可获取当前脚本的
  vfs（Nop 虚拟文件系统）资源文件路径
- 使用参考 [定制化 Nop 内置代码生成模板](/practice/custom/#custom-nop-codegen-template)

</TDesc></TRow>

<!-- -->

<TRow><TCol id="xpl-var-dsl-model"> _dsl_model </TCol>

<TCol> 解析 DSL 文件得到的 Java 模型对象 </TCol><TCol>

`IComponentModel`

</TCol><TCol>

- 仅可在元模型定义（`*.xdef`）内的 `<xdef:post-parse/>` 脚本中引用

</TCol><TDesc>

- 该变量定义在 `ExprConstants#SYS_VAR_DSL_MODEL` 上
- 使用参考 Nop 模块 `nop-xdefs` 中的
  `/nop/schema/xui/xview.xdef` 元模型定义

</TDesc></TRow>

<!-- -->

<TRow><TCol id="xpl-var-dsl-root"> _dsl_root </TCol>

<TCol> 当前已解析 DSL 的根节点 </TCol><TCol>

`XNode`

</TCol><TCol>

- 仅可在 DSL 定义内的 `x:post-extends` 脚本中引用

</TCol><TDesc>

- 该变量定义在 `ExprConstants#SCOPE_VAR_DSL_ROOT` 上
- 使用参考 [x:post-extends 的使用](/practice/custom/#post-extends-usages)

</TDesc></TRow>

</Table>
