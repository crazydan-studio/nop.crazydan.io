---
title: Nop 平台入门简介
slug: /
description: 初步了解 Nop 平台
sidebar_position: 1
custom_edit_url:
authors:
  - flytreleft
---

:::tip

点击链接 [Nop 平台知识库](https://chatglm.cn/share/FjL5q)
或扫描以下二维码，可以与[智谱清言 AI](https://chatglm.cn)
进行问答互动以了解 Nop 平台相关内容：

![](/img/ai-chat-qrcode.png)

:::

[Nop 平台](https://gitee.com/canonical-entropy/nop-entropy)
是以「[可逆计算](https://zhuanlan.zhihu.com/p/64004026)」为理论基础的软件开发平台，
其为可逆计算理论的一套 Java 实现方案，由该理论提出者
[canonical](https://www.zhihu.com/people/canonical-entropy)
设计并开发。

Nop 平台及社区相关资源：

- [可逆计算理论](https://zhuanlan.zhihu.com/p/64004026)
  - [知乎专栏](https://www.zhihu.com/column/reversible-computation)
- [Nop 源码 (@Gitee)](https://gitee.com/canonical-entropy/nop-entropy)
  - [@Github](https://github.com/entropy-cloud/nop-entropy)
- [Nop 开源社区](https://nop-platform.github.io)
- Nop 第三方资源
  - [Nop 组件包仓库](https://nop.repo.crazydan.io)
    ([备用地址](https://crazydan-studio.github.io/nop-repo))：
    直接可用的 Maven 仓库，无需在本地编译源码。详细使用说明请阅读该站点的首页内容

## Nop 平台尝试解决什么问题？

- 为可逆计算提供实现参考，其为理论实践的「先行军」
- 从零开始构建以 DSL 为设计核心的软件开发生态的基础设施
- 实现业务级别的组件复用
- 通过差量机制实现软件的可扩展性、可定制性、持续演化
- ...

## Nop 平台具备哪些优良特性？

- 有基础理论--可逆计算作为指导，不是单纯靠经验、「拍脑袋」开发而成，
  具有更加扎实的开发基础，具有更长远的发展前景
- 没有传统开发框架的历史负担
- 各个组件的设计与实现高度一致
- 开箱即用的差量生成与合并
- 自动推导
- 自动化测试：通过录制、回放的机制实现自动化测试
- 最小化表达，业务与实现分离，仅通过 NopGraphQL 引擎便可实现对
  GraphQL、Rest、RPC 等形式的接口调用
- 通过 DSL 描述业务和数据结构，再通过 GraphQL 引擎等根据 DSL 驱动业务流转
- 包含完整的 GraphQL 引擎、流程引擎、ORM 引擎、报表引擎等组件
- ...
