---
title: Nop 平台参考手册
description: 有关 Nop 内置数据和函数的使用参考信息
authors:
  - flytreleft
---

import {Table, TRow, TCol} from '@site/src/components/Table';
import Header from '@site/docs/\_header.md';

<Header />

## Xpl 上下文内置变量

<Table head={['属性名', '属性说明', '备注']}>

<TRow><TCol>

`location()`

</TCol><TCol>

Xpl 宏函数，用于获取当前执行代码所在的位置信息，其返回值类型为
`SourceLocation`

</TCol><TCol>

- 调用 `SourceLocation#getPath()` 可获取当前脚本的
  vfs（Nop 虚拟文件系统）资源文件路径
- 使用参考 [定制化 Nop 内置代码生成模板](/practice/custom/#custom-nop-codegen-template)

</TCol></TRow>

<TRow><TCol>

`_dsl_model`

</TCol><TCol>

解析 DSL 文件得到的 Java 模型对象，类型为 `IComponentModel` 的实现类

</TCol><TCol>

- 该变量定义在 `ExprConstants#SYS_VAR_DSL_MODEL` 上
- 只能在 XDef 中的 `<xdef:post-parse/>` 内引用
- 使用参考 Nop 模块 `nop-xdefs` 中的
  `/nop/schema/xui/xview.xdef` 元模型定义

</TCol></TRow>

<TRow><TCol>

`_dsl_root`

</TCol><TCol>

当前已解析 DSL 的根节点，类型为 `XNode`

</TCol><TCol>

- 该变量定义在 `ExprConstants#SCOPE_VAR_DSL_ROOT` 上
- 使用参考 [x:post-extends 的使用](/practice/custom/#post-extends-usages)

</TCol></TRow>

</Table>
