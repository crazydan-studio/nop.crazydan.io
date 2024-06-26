---
title: Nop 平台使用答疑
description: 记录在可逆计算交流群中的一些使用方面的答疑
authors:
  - flytreleft
---

import {Conversation, Ask, Reply, Note} from '@site/src/components/Conversation';

> 为避免隐私泄漏，群友问答均以匿名形式组织。另外，为便于阅读和理解，部分问答内容会做相应调整。

:::tip

- 若您希望向该栏目补充内容，请点击该栏目底部的编辑链接，并向其 Git 仓库提交新的内容；
- 为便于搜索和查看，请务必提交包含足够信息且有价值的文字内容，不要仅提供图片；

:::

<Conversation
asker={{ img: '/img/avatar/anonymous.svg' }}
replier={{ img: '/img/avatar/anonymous.svg' }}>

<Ask>

## 找不到符号 (nop.err.codegen.gen-aop-proxy-fail)

```log
[ERROR] Failed to execute goal org.codehaus.mojo:exec-maven-plugin:3.0.0:java 
(aop) on project nop-tcc-dao: An exception occured while executing the Java class. 
NopException[seq=1,status=-1,errorCode=nop.err.codegen.gen-aop-proxy-fail,
params={message=[Message:

[ERROR] 找不到符号
[ERROR] 符号: 类  TccRecordRepository
[ERROR] 位置: 程序包  io.nop.tcc.dao.store
[ERROR] Code of concern: ".TccRecordRepository"
[ERROR] line: 4,col: 67
```

</Ask>

<Reply>

找一个比较浅的目录重新 checkout 一份代码。今天一个同学的问题是目录太深，
checkout 的时候部分文件没有 checkout 成功。

</Reply>

<Ask>

## 在 XMeta 中定义了 `mapToProp` 映射属性，但报该属性未定义

该属性定义如下：

```xml
    <prop name="optionsData"
          mapToProp="optionsComponent.data"
          graphql:type="[Map]" />
```
<br/>

异常错误码为 `nop.err.orm.model.unknown-prop`。

</Ask>

<Reply>

在 Nop GraphQL 引擎中处理 `mapToProp` 映射属性时，
需通过 `OrmFetcherBuilder` 构造 `OrmDependsPropFetcher` 来获取属性，
若没有这两个 class 则会按普通属性处理，但是 `optionsData` 是虚拟属性，
在 ORM 实体上并未定义，所以，会报属性未定义的错误。

这两个 class 在 `io.github.entropy-cloud:nop-graphql-orm` 组件中，
因此，只需要在 Maven 工程中引入该依赖即可。

</Reply>

<Ask>

## 在显式调用 `ContextProvider#runWithTenant` 并在多对多和一对多关系中新增实体时报 `nop.err.orm.missing-tenant-id` 异常

启用租户的情况下，在多对多关系中使用 `setRelatedXxxIdList` 添加中间表中不存在的记录，
以及在一对多关系中，向子表集合中添加原本不存在的实体，
都会出现 `nop.err.orm.missing-tenant-id` `没有设置租户属性` 的异常，
应该是级联插入的时候没有处理关联实体的租户 `id`。

</Ask>

<Reply>

不应该。只要上下文 `IContext` 中有 `tenantId` 就会设置到对象上。
实体保存时不区分是否是被级联关联的对象。

可以在报错的地方断点看一下，是不是从 context 上取不到 `tenantId`。

</Reply>

<Ask>

就是在 `ContextProvider#runWithTenant` 函数里面运行的，把关联实体添加这部分代码去掉，主表实体是可以保存的。

</Ask>

<Reply>

如果是显式使用 `ContextProvider#runWithTenant`，那么出回调函数之前需要 `flushSession`。

</Reply>

<Ask>

在回调函数的末尾刷了 `ormSession`，果然不出错了。这是不是意味着，在真正写入数据库的时候，
才会从当前的 `IContext` 获取 `tenantId`，并写入库。
之前没有刷数据，等到真正入库的时候，上下文环境中已经没有 `tenantId`，就报错了。

但是，只有写入关联实体才会出错，如果只写本身的实体，并不会报错，这是什么原因？

</Ask>

<Reply>

因为关联实体是 `session.flush` 的时候通过 `CascadeFlusher` 才真正调用了
`save`，否则它只是与实体挂接，并没有真正调用 `persist`。

</Reply>

</Conversation>
