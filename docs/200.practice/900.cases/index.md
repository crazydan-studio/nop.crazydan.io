---
title: 功能开发样例
description: 对一些常用功能提供开发样例
authors:
  - flytreleft
---

import Header from '@site/docs/\_header.md';

<Header />

> 注意，本文内容还在整理中，目前都是一些片段信息。

## Excel 数据导入 {#import-by-excel}

- Excel 导入只能先通过端点 `/f/upload` 上传，然后，在 `@BizModel`
  中的数据导入接口中通过 `IOrmEntityFileStore` 获取上传的文件，
  再读取 Excel 并导入数据
  - 导入 Excel 的第一列必须是序号列，且单元格的值只能包含数字，
    但不要求序号递增，序号也可以相同。其作用仅仅是指示数据行在哪里结束
  - `expandType=r\nexpandExpr=data\nvalueExpr=cell.expandIndex+1`
    返回展开元素的下标。如果要获得全局序号，使用 `xptRt.incAndGet("sss")`
    便会创建一个内存中使用的序列号
    - `expandType`：指定展开方向，其中，`r` 为按行展开，`c` 为按列展开
    - `expandExpr`：指定展开表达式，其结果为集合，并按照其元素挨个展开
    - `valueExpr`：单元格表达式。可以在单元格内设置：`*=fieldName`
      表示取展开集合元素的 `fieldName` 属性值，`${cell.expandIndex+1}`
      表示取 tpl 表达式的结果，其可访问 `scope` 中的变量
    - `expandExpr` 只能在展开方向的开始单元格上以备注形式设置，
      否则，会从备注位置按指定展开方向（`expandType`）做多级展开

功能要求：

- 支持导入 Excel 中的多个 Sheet 数据，每个 Sheet 内都是集合数据
- 利用已有的数据新增/更新接口导入数据，避免重复编写数据入库逻辑

```java
  // 注意，字段不能声明为 private，Nop IoC 无法注入私有成员变量
  @Inject
  IOrmEntityFileStore fileStore;

  @BizMutation
  public void importExcel(@Name("importFile") String importFile, IServiceContext context) {
    String fileId = this.fileStore.decodeFileId(importFile);

    // 总是处理上传的临时文件
    String objId = FileConstants.TEMP_BIZ_OBJ_ID;
    IResource resource = this.fileStore.getFileResource(fileId, getBizObjName(), objId, "importFile");

    DynamicObject results = (DynamicObject) ExcelReportHelper.loadXlsxObject(
            "/xxx/yyy/demo/templates/demo-import.imp.xml",
            resource);

    // 解析结果的属性 entities 与 *.imp.xml 在 sheet 上指定的 field 属性值一致
    Map<String, List<DynamicObject>> entities = (Map<String, List<DynamicObject>>) results.prop_get("entities");
    if (entities != null) {
      entities.forEach((key, list) -> list.forEach((entity) -> save_update(entity.toMap(), context)));
    }

    // 导入成功后，再删除上传文件
    this.fileStore.detachFile(fileId, getBizObjName(), objId, "importFile");
  }
```

```xml title="_vfs/xxx/yyy/demo/templates/demo-import.imp.xml"
<?xml version="1.0" encoding="UTF-8" ?>
<imp xmlns:x="/nop/schema/xdsl.xdef"
     x:schema="/nop/schema/excel/imp.xdef">

  <sheets>
    <!--
    list="true"：表示当前 sheet 解析得到的结果是一个 List
    multiple="true"：表示按此结构匹配多个 sheet
    multipleAsMap="true"：表示按照 sheet 的名称构成一个 Map

    最终解析得到的数据结构为：
    ```json
    {
        entities: {
            [sheetName]: [{...}, ...]
        }
    }
    ```

    Note：
    - 不设置 resultType 以直接构造 DynamicObject，
      从而便于直接利用 BizModel 的接口做数据新增或更新
    - 导入 Excel 中的列表数据的第一列必须是序号列，其单元格只能包含数字，
      但不要求其为数字类型，也不要求序号唯一，只要是数字即可
    - 不做导入但存在的列，需将其表记为虚拟列（virtual="true"）
    -->
    <sheet name="entity" namePattern=".*"
            list="true" field="entities"
            multiple="true" multipleAsMap="true"
    >
      <fields>
        <field name="id" displayName="ID"
                mandatory="false">
          <schema stdDomain="string" />
        </field>
        <field name="engine" displayName="引擎名称"
                mandatory="true">
          <schema stdDomain="string" />
        </field>
        <field name="browser" displayName="浏览器"
                mandatory="true">
          <schema stdDomain="string" />
        </field>
        <field name="platform" displayName="运行平台"
                mandatory="true">
          <schema stdDomain="string" />
        </field>
      </fields>
    </sheet>
  </sheets>
</imp>
```

```bash
# MinIO 容器部署文档: https://min.io/docs/minio/container/operations/install-deploy-manage/deploy-minio-single-node-single-drive.html#minio-snsd
docker run -dt \
  --name minio \
  -p 9000:9000 -p 9001:9001 \
  -e "MINIO_VOLUMES=/mnt/data" \
  -e "MINIO_OPTS=--console-address :9001" \
  -e "MINIO_ROOT_USER=user" \
  -e "MINIO_ROOT_PASSWORD=password" \
  minio/minio server
```

## Excel 数据导出 {#export-by-excel}

功能要求：

- 从数据库查询并导出分页数据
- 利用已有的查询接口做数据查询，避免重复写查询接口
- 导出数据包含序号列，并且需要自动递增

```java
  @BizQuery
  public WebContentBean exportExcel(@Name("fileName") String fileName, IServiceContext context) {
    QueryBean query = new QueryBean();
    query.setOffset(0);
    query.setLimit(Integer.MAX_VALUE);

    // 利用分页查询接口，还可以实现数据权限控制
    PageBean<DemoForm> pageBean = findPage(query, null, context);

    IReportEngine reportEngine = BeanContainer.getBeanByType(IReportEngine.class);
    ITemplateOutput output = reportEngine.getRenderer("/xxx/yyy/demo/templates/demo-export.xpt.xlsx",
                                                      "xlsx");

    IEvalScope scope = XLang.newEvalScope();
    scope.setLocalValue("data", pageBean.getItems());

    String timestamp = DateHelper.formatJavaDate(new Date(), "_yyyy-MM-dd_HH-mm-ss");
    // TODO 需处理文件较大的情况
    byte[] bytes = output.generateBytes(scope);

    return new WebContentBean("application/octet-stream", bytes, fileName + timestamp + ".xlsx");
  }
```

## Word 数据导出 {#export-by-word}

功能要求：

- Word 内附带导出指定的图片
- 要导出的数据来自于用户提交，不涉及数据库查询

```java
  // 注意，字段不能声明为 private，Nop IoC 无法注入私有成员变量
  @Inject
  IOrmEntityFileStore fileStore;

  @BizQuery
  public WebContentBean exportWord(
    @Name("fileName") String fileName,
    @Name("data") Map<String, Object> data,
    IServiceContext context
  ) {
    IResource resource = VirtualFileSystem.instance()
                                          .getResource("/xxx/yyy/demo/templates/demo-export.xpt.docx");

    String fileId = this.fileStore.decodeFileId(data.get("image").toString());
    String objId = FileConstants.TEMP_BIZ_OBJ_ID;
    IResource image = this.fileStore.getFileResource(fileId, getBizObjName(), objId, "imageFile");
    data.put("image", image);

    IEvalScope scope = XLang.newEvalScope();
    scope.setLocalValue("entity", data);

    WordTemplate tpl = new WordTemplateParser().parseFromResource(resource);
    byte[] bytes = tpl.generateBytes(scope);

    // Word 生成成功后才删除图片文件，以便于出现异常后，前端可以重新执行导出
    this.fileStore.detachFile(fileId, getBizObjName(), objId, "importFile");

    String timestamp = DateHelper.formatJavaDate(new Date(), "_yyyy-MM-dd_HH-mm-ss");
    return new WebContentBean("application/octet-stream", bytes, fileName + timestamp + ".docx");
  }
```

## 参考资料

- [Nop Excel 导入/导出](https://gitee.com/canonical-entropy/nop-entropy/blob/master/docs/dev-guide/report/excel-import.md)
  - [按条件设置单元格样式](https://gitee.com/canonical-entropy/nop-entropy/blob/master/docs/dev-guide/report/excel-import.md#%E5%8A%A8%E6%80%81%E8%AE%BE%E7%BD%AE%E5%8D%95%E5%85%83%E6%A0%BC%E6%A0%B7%E5%BC%8F)
  - [使用场景说明](https://gitee.com/canonical-entropy/nop-entropy/blob/master/docs/user-guide/report.md)
- [Nop 文件上传/下载](https://gitee.com/canonical-entropy/nop-entropy/blob/master/docs/dev-guide/graphql/upload.md):
  支持 MinIO 等云存储
- [Nop Word 模板配置](https://gitee.com/canonical-entropy/nop-entropy/blob/master/docs/dev-guide/report/word-template.md)
