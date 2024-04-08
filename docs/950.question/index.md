---
title: Nop 平台使用答疑
description: 记录在可逆计算交流群中的一些使用方面的答疑
authors:
  - flytreleft
---

import {Conversation, Ask, Reply, Note} from '@site/src/components/Conversation';

> 为避免隐私泄漏，群友问答均以匿名形式组织。另外，为便于阅读和理解，部分问答内容会做相应调整。

:::tip

- 若你希望向该栏目补充内容，请点击该栏目底部的编辑链接，并向其 Git 仓库提交新的内容；
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

</Conversation>
