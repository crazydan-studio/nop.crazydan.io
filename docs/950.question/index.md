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

<Ask>

## Nop 的数据权限使用

</Ask>

<Reply>

数据权限做了不兼容的变更，`role-auth` 的 `roleId` 属性改成了 `roleIds`, 允许多个角色使用同样的数据权限项。
具体参见 [auth.md](https://gitee.com/canonical-entropy/nop-entropy/blob/master/docs/dev-guide/auth/auth.md)。

有时系统会存在动态赋权的情况。比如一个人设置了将某个表中部分记录开放给指定的人员等。
一般这种特殊权限相关的内容都是明确的业务使用场景，可以在 xbiz 中通过动态生成 filter 来实现。
但是有时这种情况很多或者规则比较一致，不想在每个对象中去编写，那么也可以在数据权限层面统一处理。

`data-auth.xml` 配置中支持 `role-decider` 配置，它可以动态确定当前用户所对应的角色集合，从而选择不同的过滤条件。

```xml
<data-auth>
  <role-decider>
    // 根据 authObjName, userContext, svcCtx 等动态确定角色。返回角色id的集合，或者逗号分隔的角色id。
  </role-decider>
</data-auth>
```

- `role-decider` 返回的角色 id 集合会直接覆盖 `IUserContext` 上的角色设置。
- 可以将一些动态决策结果缓存到 `userContext` 或者 `svcCtx` 上，避免返回查询数据库等。
  `userContext` 的缓存是用户 session 级别，而 `svcCtx` 的缓存是 request 级别。

数据权限配置提供了两个动态性：

- `authObjName`：自己根据业务动态确定。
- `dynamicRoles`：不同的用户对于不同的业务对象可以有不同的角色集合，通过 `role-decider` 来动态计算得到。

`authObjName` 对应不同的业务场景，一个业务场景下会存在多个操作。
最简单的，`get` 和 `findPage/findList` 都要收到 `data-auth` 的限制，一个业务场景下的限制条件是一样的。
`data-auth` 的 filter 会被编译为内存中的 Predicate，在 get 的时候也会应用：

- 本身如果是业务方法层面的权限过滤条件应该在 xbiz 里配置。
- 如果是横切于多个业务方法，就是业务场景层面，这时才会进入 `data-auth`，然后用 `authObjName` 来选择业务场景。
- 通过 `role-decider` 可以动态选择在指定业务场景中的角色。
- 在具体的 `role-auth` 配置中，执行 `when` 条件判断，只有 `when` 检查通过，才会选择该权限条目执行。
- 在 `filter` 和 `check` 段中可以利用 xpl 模板语言的抽象能力来处理指定场景、指定角色下的更多的权限动态过滤需求。

以上几种情况应该覆盖了所有应用场景：

- 通过数据库的 `NopAuthRoleDataAuth` 实体可以在线配置数据权限
- 在线配置时为避免出现安全性问题，filter 段只能使用 `biz!filter.xlib`，名字空间是 biz。
  `whenConfig` 配置只能使用 `biz!when.xlib` 标签库中定义的标签。
- `whenConfig` 可以直接配置标签名，比如 `biz:WhenAdmin` 或者 `<biz:WhenXX type='1' />`

</Reply>

<Reply>

- 数据权限对外的抽象是一个动态 filter：`filter = authFilter(authObjName, roleId, context)`。
- 架构的作用是实现线性化分解：`filter = loader(authObjName, roleId)(authObjName, roleId, context)`，
  参见[从张量积看低代码平台的设计](https://mp.weixin.qq.com/s/BFCTN73pH8ZZID3Dukhx3Q)。
- 不能被线性化的部分一般是具体业务相关，直接在 xpl 标签里定义业务相关的标签来解决。
  比如增加额外的配置表，这里可以读取配置表中的数据，最终生成过滤条件等。`when` 配置用于从多个权限配置中动态选择一个。
  选择时先按照 `priority` 排序，选择第一个满足条件的权限项。

</Reply>

</Conversation>
