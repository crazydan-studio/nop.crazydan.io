---
title: 定制化开发
description: 与定制化开发相关的内容
authors:
  - flytreleft
---

import Header from '@site/docs/\_header.md';

<Header />

## `XCodeGenerator` 的阶段构建 {#code-gen-building}

默认定义的 DSL 并不会生成 Java Class，若是模型结构需要以代码形式使用，
则需要通过 `XCodeGenerator` 从 DSL 生成代码。

在开发过程中可以在 Maven 构建阶段生成，也可以在单元测试中调用
`XCodeGenerator` 的生成函数。二者本质是一样的，只是执行时机不同：

- Maven 方式是在代码构建时才生成，每次修改 dsl 后，都需要执行
  `mvn compile` 命令
- 在单元测试中的方式，可以在运行测试用例时自动生成最新代码

无论何种方式，都需要在 Maven 模块的根目录内创建以 Maven 构建阶段名称命名的目录，
并在其中放置 `xgen` 脚本。

不同的 Maven 构建阶段，具有不同的特性，需要根据实际情况编写不同的构建逻辑：

- `precompile`：预构建的第一阶段，在该阶段还未将 `src/main/resources`
  目录中的资源复制到 `target` 目录下，也就不能在该阶段访问到当前项目的
  classpath 资源，故而，在该目录的 `xgen` 脚本中，不能为当前项目中的
  DSL 生成代码
- `precompile2`：预构建的第二阶段，在该阶段中，`src/main/resources`
  下的资源已经复制到 `target` 目录下，可以访问当前项目中的 classpath
  资源，故而，只能在该阶段为本项目内的 DSL 生成代码
- `postcompile`：构建完成的后处理，可以执行一些非代码相关的构建

若是在单元测试中自动生成或更新 DSL 的代码，可以在 `@BeforeAll`
函数中调用如下代码：

```java
File projectDir = MavenDirHelper.projectDir(XxxTest.class);

XCodeGenerator.runPrecompile(projectDir, "/", false);
XCodeGenerator.runPrecompile2(projectDir, "/", false);
XCodeGenerator.runPostcompile(projectDir, "/", false);
```

> 由于运行单元测试时，本项目内的资源均在 classpath 内，
> 故而，无需区分构建阶段，只需要依次运行全部 `xgen` 脚本即可

在 `xgen` 脚本中生成 DSL 代码的内容如下：

```xml title="/precompile2/gen-xdsl.xgen"
<c:script xmlns:c="c"><![CDATA[
  codeGenerator.renderModel('/xxx/schema/web/site.xdef', '/nop/templates/xdsl', '/', $scope);
  codeGenerator.renderModel('/xxx/schema/web.xdef', '/nop/templates/xdsl', '/', $scope);
]]></c:script>
```

- `codeGenerator` 为当前代码生成器 `XCodeGenerator` 变量，在
  `XCodeGenerator#execute` 中定义
- `$scope` 为在 `EvalGlobalRegistry` 中注册的全局变量
  `ScopeGlobalVariable`，代表当前的构建作用域
- 在 `*.xdef` 内外联其他 XDef 时，需要显式调用 `XCodeGenerator#renderModel`
  生成代码，默认不会对外联的 XDef 生成代码
- Maven 构建内置的变量在 `CodeGenTask#execute` 中定义
- 在 XDef 中可以访问生成函数 `XCodeGenerator#renderModel` 中定义的变量

## `x:gen-extends` 的使用 {#gen-extends-usages}

`x:gen-extends` 在 DSL 中使用，用于动态展开其生成节点树，并与其所在的父节点做合并。

其有如下几种使用方式：

```xml title="方式一"
  <!-- ... -->
  <title>
    <x:gen-extends>
      <any>${'Nop 平台'}</any>
    </x:gen-extends>
  </title>
```

```xml title="方式二"
  <!-- ... -->
  <title>
    <x:gen-extends>
      <c:script><![CDATA[
        const title = 'Nop 平台';
      ]]></c:script>

      <any>${title}</any>
    </x:gen-extends>
  </title>
```

以上方式的最终结果均为 `<title>Nop 平台</title>`。

也就是，`x:gen-extends` 生成的节点树将与其所在的父节点做合并，
而生成树的根节点可以为任意标签（样例中为 `any`）。
在涉及复杂计算处理时，一般将逻辑放在 `c:script` 中，
并在生成树中通过 `${}` 引用在 `c:script` 中定义的 `let`
或 `const` 变量。

> 如果，`x:gen-extends` 所在的节点是 DSL 的根节点，
> 则其生成树的根节点需要与 DSL 根节点的标签名称相同。

## 编写 `x:gen-extends` 的运行代码 {#write-gen-extends-execution-code}

如果是在 xpl 模板内：

```xml {6} title="/path/to/site-html.xgen"
<x:gen-extends
  xmlns:x="/nop/schema/xdsl.xdef"
  xmlns:xpl="xpl" xmlns:web="web"
>

  <web:GenSiteHtml site="${site}" xpl:lib="/web/xlib/web.xlib" />
</x:gen-extends>
```

则先通过 `XLangCompileTool` 编译，再执行函数：

```java {4,7,11,14}
XLangCompileTool compiler = XLang.newCompileTool();
// Note：在编译 xpl 时需要获取 ${} 中的变量，但在编译器中无法注入该变量，
// 故而，需要忽略未注册变量，以确保编译能够正常进行
compiler.getScope().setAllowUnregisteredScopeVar(true);

XNode node = XNodeParser.instance().parseFromVirtualPath("/path/to/site-html.xgen");
ExprEvalAction action = compiler.compileTagBody(node, XLangOutputMode.node);

// 注入变量
IEvalScope scope = XLang.newEvalScope();
scope.setLocalValue("site", site);

// 执行 xpl 函数并得到 XNode 树
XNode htmlNode = action.generateNode(scope);
String html = htmlNode.innerHtml();
```

而如果是在 DSL 中：

```xml {7} title="/path/to/site-html.xml"
<html xmlns:x="/nop/schema/xdsl.xdef"
      xmlns:xpl="xpl" xmlns:web="web"
      x:schema="/schema/web/html.xdef"
>

  <x:gen-extends>
    <web:GenSiteHtml site="${$site}" xpl:lib="/web/xlib/web.xlib" />
  </x:gen-extends>
</html>
```

则直接使用 `DslModelParser` 解析得到 DSL 模型即可，`x:gen-extends` 将自动执行：

```java {2}
DynamicObject obj =
  (DynamicObject) new DslModelParser()
                      .parseFromVirtualPath("/path/to/site-html.xml");
```

需要注意的是，在 DSL 中，`x:gen-extends` 只能引用全局变量，而全局变量需要通过
`EvalGlobalRegistry.instance().registerVariable(...)` 进行注册，并且变量名称需以
`$` 开头。该全局变量是所有线程共享的，对于临时变量的注入，需要通过 `ThreadLocal`
来暂存。**注：应尽可能避免使用全局变量，优先保证 DSL 的无状态性，以充分利用缓存等机制。**

如果需要解析得到 DSL 的 `XNode` 节点对象，则通过 `DslNodeLoader` 加载 DSL 定义即可：

```java {2}
IResource resource = VirtualFileSystem.instance().getResource(path);
XNode node = new DslNodeLoader()
                .loadFromResource(resource)
                 .getNode();
```

## `x:post-extends` 的使用 {#post-extends-usages}

`x:post-extends` 的作用是对当前已解析的 DSL 做后处理，可以对 DSL
模型进行数据修改，或者，增减节点以调整其结构，也就是，可以对解析后的 DSL 做差量。

> 在 `x:post-extends` 节点上可设置 `x:override`
> 来指定其展开节点与当前 DSL 的合并策略。

以如下 DSL 为例，其目的是通过 `x:post-extends` 统一修正 `web/site/resource`
节点的 `url` 属性，使其使用 GraphQL 的 `PageProvider__getPage`
端点获取资源的页面结构：

```xml
<web xmlns:x="/nop/schema/xdsl.xdef"
     xmlns:xpl="xpl" xmlns:web="web"
     x:schema="/schema/web.xdef"
>

  <x:post-extends x:override="merge">
    <web:UpdateWebSiteResourceUrl
        xpl:lib="/web/xlib/web.xlib" />
  </x:post-extends>

  <site id="signin" title="用户登录">
    <resources>
      <resource
          id="signin"
          url="/web/pages/auth/signin.page.xml"
      />
    </resources>
  </site>
</web>
```

在 xpl 函数 `web:UpdateWebSiteResourceUrl` 中可以有以下两种实现方式：

```xml title="/web/xlib/web.xlib"
    <!-- ... -->
    <UpdateWebSiteResourceUrl outputMode="node">
      <!--  _dsl_root 为当前已解析的 DSL 根节点 -->
      <attr name="_dsl_root" implicit="true" />

      <source>
        <web>
          <c:for var="site"
              items="${_dsl_root.childrenByTag('site')}"
          >
            <site id="${site.attrText('id')}"
                  xpl:if="site.hasChild('resources')"
            >
              <resources>
                <thisLib:_PatchSiteResourcesUrl
                    resources="${site.childByTag('resources').children}"
                />
              </resources>
            </site>
          </c:for>
        </web>
      </source>
    </UpdateWebSiteResourceUrl>

    <_PatchSiteResourcesUrl outputMode="node">
      <attr name="resources" />

      <source>
        <c:script><![CDATA[
          function genPageUrl(path) {
            if (path == null || path.isEmpty()) {
              return path;
            }
            return '@query:PageProvider__getPage?path=' + path;
          }
        ]]></c:script>

        <c:for items="${resources}" var="resource">
          <resource
              id="${resource.attrText('id')}"
              url="${genPageUrl(resource.attrText('url'))}"
          >
            <children xpl:if="resource.hasChild('children')">
              <thisLib:_PatchSiteResourcesUrl
                  resources="${resource.childByTag('children').children}"
              />
            </children>
          </resource>
        </c:for>
      </source>
    </_PatchSiteResourcesUrl>
```

```xml title="/web/xlib/web.xlib"
    <!-- ... -->
    <UpdateWebSiteResourceUrl>
      <!--  _dsl_root 为当前已解析的 DSL 根节点 -->
      <attr name="_dsl_root" implicit="true" />

      <source>
        <c:script><![CDATA[
          function genPageUrl(path) {
            if (path == null || path.isEmpty()) {
              return path;
            }
            return '@query:PageProvider__getPage?path=' + path;
          }

          function updateResources(resources) {
            resources.forEach((resource) => {
              const url = genPageUrl(resource.getAttr('url'));
              resource.setAttr('url', url);

              updateResources(resource.childByTag('children')?.children || []);
            });
          }

          _dsl_root
              .childrenByTag('site')
              .filter((site) => site.hasChild('resources'))
              .forEach(
                (site) => updateResources(
                  site.childByTag('resources').children
                )
              );
        ]]></c:script>
      </source>
    </UpdateWebSiteResourceUrl>
```

> 该方式没有输出，所以，不设置 `outputMode`。

第一种方式是直接生成差量 DSL 树，再按照在 `x:post-extends`
上指定的合并策略与当前的 DSL 树进行合并。

而第二种则是直接编写代码逻辑对当前的 DSL 树结构进行遍历和调整，
不过，其不输出差量树，所以，`x:override="merge"` 的设置是无效的。

第一种方式可以清晰展示差量作用的坐标位置，而第二种方式的代码则比较简洁。
可以根据需求任意选择可行的实现方式。

## 创建最小 Quarkus 应用服务启动器 {#create-mini-quarkus-app-starter}

> 该启动器基于对 Nop 平台的 `nop-quarkus/nop-quarkus-core-starter`
> 和 `nop-quarkus/nop-quarkus-web-starter` 模块的合并改造而成。

Quarkus 应用服务启动器需满足以下要求：

- 以独立依赖包方式引入具体的应用服务 Maven 模块中，
  引入后便可以构建 Quarkus 应用可执行 jar 包，
  并且也可以在 IDE 中运行调试
- 支持 Nop IoC 机制，可以将定义在应用服务依赖模块中的 beans
  加载到 Quarkus 运行环境中
- 自动初始化 Nop 环境，自动加载 `IHttpServerFilter`
  过滤器，从而支持基于 Nop 的应用服务的运行
- 仅需打包 jar，不打包可执行文件或 Docker 容器镜像

首先，创建共用的启动器核心模块 `quarkus-starter`，并添加项目的最小依赖：

```xml title="quarkus-starter/pom.xml"
  <!-- ... -->
  <dependencies>
    <dependency>
      <groupId>io.github.entropy-cloud</groupId>
      <artifactId>nop-boot</artifactId>
    </dependency>
    <dependency>
      <groupId>io.github.entropy-cloud</groupId>
      <artifactId>nop-http-api</artifactId>
    </dependency>

    <!-- 使用 caffeine（高性能缓存库）依赖的 graalvm 版本 -->
    <dependency>
      <groupId>io.quarkus</groupId>
      <artifactId>quarkus-caffeine</artifactId>
    </dependency>
    <dependency>
      <groupId>io.quarkus</groupId>
      <artifactId>quarkus-config-yaml</artifactId>
    </dependency>
    <dependency>
      <groupId>io.quarkus</groupId>
      <artifactId>quarkus-arc</artifactId>
    </dependency>
    <!--
    Note：需要排除 quarkus-bootstrap-core（被 quarkus-core-deployment 依赖），
    否则在 IDE 中启动 @QuarkusMain 的 main 函数会失败，只能用 quarkus 插件启动
    -->
    <dependency>
      <groupId>io.quarkus</groupId>
      <artifactId>quarkus-vertx-http</artifactId>
    </dependency>
  </dependencies>

  <build>
    <plugins>
      <!--
      创建 *.class 索引，并记录在 META-INF/jandex.idx 中。
      Quarkus 依赖该索引来查找 @ApplicationScoped 等
      Beans（https://quarkus.io/guides/cdi-reference#bean_discovery），
      若未创建该索引，则包内标注的 @ApplicationScoped 等的 class
      将不会被载入到 Quarkus Beans 容器中
      -->
      <plugin>
        <groupId>org.jboss.jandex</groupId>
        <artifactId>jandex-maven-plugin</artifactId>
      </plugin>
    </plugins>
  </build>
```

直接将 Nop 平台中的以下 class 复制到 `quarkus-starter` 模块中：

- `HttpServerFilterRegistrar`：注册 `IHttpServerFilter` 过滤器
- `VertxHttpServerContext`：基于 Quarkus Vertx 的上下文
  `IHttpServerContext` 实现
- `NopQuarkusBeanContainer`：基于 Quarkus 的 bean 容器
  `IBeanContainer` 的实现
- `QuarkusExecutorHelper`：创建 Quarkus 异步任务
- `QuarkusIntegration`：初始化 Nop 平台配置，并注册
  `NopQuarkusBeanContainer`

然后，创建启动器辅助对象 `QuarkusStarter`，用于执行通用的启动和结束逻辑：

```java title="QuarkusStarter.java"
public class QuarkusStarter {

  public static int start(String... args) throws Exception {
    QuarkusIntegration.start();

    NopApplication app = new NopApplication();

    // #run 默认是执行完后便返回的，
    return app.run(args, () -> {
      // 故而，需要一直等待应用服务进程的结束
      Quarkus.waitForExit();
      return 0;
    });
  }

  public static void stop(int exitCode, Throwable e) {
    CoreInitialization.destroy();
  }
}
```

接着，创建应用服务可执行包的打包模块：

```xml {4-5,10,20,28} title="pom.xml"
  <!-- ... -->
  <properties>
    <!-- 该模块为独立服务包，不会被其他项目所依赖，故，不发布至仓库 -->
    <maven.deploy.skip>true</maven.deploy.skip>
    <maven.install.skip>true</maven.install.skip>
  </properties>

  <dependencies>
    <dependency>
      <artifactId>quarkus-starter</artifactId>
    </dependency>

    <!-- ... -->
  </dependencies>

  <profiles>
    <profile>
      <id>quarkus</id>
      <activation>
        <activeByDefault>true</activeByDefault>
      </activation>
      <properties>
        <!--
        配置 Quarkus 的默认打包类型: https://quarkus.io/guides/building-native-image
        - native: Docker 镜像打包
        - uber-jar: 单一可执行的 jar 包
        - fast-jar: 各依赖包分类放置的组织形式，方便复用公共基础 jar，执行入口为
          target/quarkus-app/quarkus-run.jar
        -->
        <quarkus.package.type>uber-jar</quarkus.package.type>
      </properties>
    </profile>
  </profiles>

  <build>
    <plugins>
      <plugin>
        <groupId>io.quarkus</groupId>
        <artifactId>quarkus-maven-plugin</artifactId>
        <version>${quarkus.platform.version}</version>
        <executions>
          <execution>
            <goals>
              <goal>build</goal>
            </goals>
          </execution>
        </executions>
      </plugin>
    </plugins>
  </build>
```

由于 Quarkus 的启动器不能在依赖包中实现（在依赖包中实现时，将不能扫描到应用服务中的
classpath 资源），故而，需要再在该各个应用服务模块内创建一个最简的
Quarkus 启动器 `AppStarter`：

```java {1,6,11} title="AppStarter.java"
@QuarkusMain
public class AppStarter implements QuarkusApplication {

  public static void main(String... args) {
    // https://quarkus.io/guides/lifecycle#the-main-method
    Quarkus.run(AppStarter.class, QuarkusStarter::stop, args);
  }

  @Override
  public int run(String... args) throws Exception {
    return QuarkusStarter.start(args);
  }
}
```

> 该启动器需实现 `QuarkusApplication` 接口，并在 `Quarkus#run`
> 的第二个参数提供退出清理函数。

至此，最小的 Quarkus 应用服务启动器便创建完成。

剩下的，便可以在应用服务模块内引入外部的 `IHttpServerFilter`
实现，或者，在该模块内通过 `@Observes` 等添加与 Quarkus
相关的适配逻辑。

> 在非 `@QuarkusMain` 所在模块内添加 `@Observes` 标注的接口，
> 需要在模块内启用 Maven 插件 `org.jboss.jandex:jandex-maven-plugin`，
> 并在其 class 上添加类注解 `@ApplicationScoped`，这样才能通过 Quarkus
> 加载该接口。

此外，应用服务的本地配置定义在 `src/main/resources`
中的 YAML 文件中：

- `bootstrap.yaml`：应用服务的启动配置，通过
  `CoreInitialization#loadBootstrapConfig` 载入。
  在其中按配置变量 `quarkus.profile` 的值做多环境配置，
  且根键为 `"%${profile}"` 形式，其中，`${profile}`
  为 `quarkus.profile` 的值
- `application.yaml`：应用服务的运行配置，可设置
  Quarkus 和 Nop 的配置数据
- `application-${profile}.yaml`：与配置变量 `quarkus.profile`
  对应的配置文件，当 `${profile}` 与 `quarkus.profile`
  的值相同时，便会加载该配置文件中的配置数据。可用于多环境配置的需求场景

```yaml title="bootstrap.yaml"
"%dev":
  # 跟踪系统内的 Java 反射调用，并自动生成 Graalvm 原生镜像所需的的配置文件，
  # 如，proxy-config.json、reflect-config.json、nop-vfs-index.txt 等。
  # 其定义在 io.nop.codegen.CodeGenConfigs.CFG_CODEGEN_TRACE_ENABLED，
  # 需要在依赖中引入 nop-codegen 模块，并确保模块根据目下的子目录
  # precompile/precompile2/postcompile 不全部为空
  nop.codegen.trace.enabled: true
```

## Nop Beans 的创建与加载 {#nop-beans-creation-and-loading}

Nop 平台提供 IoC 机制，用于 Java Beans 的创建和依赖注入。

所有的 Java Beans 都以 DSL 进行声明，并且同样支持差量合并等特性。

要使用该机制，首先需要引入 `nop-ioc` 依赖：

```xml title="pom.xml"
  <!-- ... -->
  <dependencies>
    <!-- ... -->

    <!-- 支持注入 _vfs/nop/autoconfig/*.beans 中定义的 beans -->
    <dependency>
      <groupId>io.github.entropy-cloud</groupId>
      <artifactId>nop-ioc</artifactId>
    </dependency>
  </dependencies>
```

然后，在 Nop 虚拟文件系统中创建 `/nop/autoconfig/xxx.beans`，
并在其中指定 Beans DSL 的位置：

```txt title="src/main/resources/_vfs/nop/autoconfig/xxx.beans"
/xxx/xxx/beans/default.beans.xml
```

> `*.beans` 与 `*.beans.xml` 的名称可按需自定义。

最后，在 `*.beans.xml` 中定义需要创建的 Beans：

```xml title="src/main/resources/_vfs/xxx/xxx/beans/default.beans.xml"
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:x="/nop/schema/xdsl.xdef" xmlns:ioc="ioc"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:schemaLocation="http://www.springframework.org/schema/beans
        http://www.springframework.org/schema/beans/spring-beans-2.5.xsd"
       x:schema="/nop/schema/beans.xdef"
>

  <bean id="webSiteHttpServerFilter"
        class="org.xxx.web.filter.WebSiteHttpServerFilter"
        ioc:default="true">
    <property name="provider" ref="webSiteProvider" />
  </bean>

  <bean id="webSiteProvider"
        class="org.xxx.web.WebSiteProvider">
  </bean>
</beans>
```

`*.beans.xml` 为 Nop 平台的 DSL，并且定义在其虚拟文件系统之上，
可以与其他 DSL 一样对定义的 Beans 做差量修订，
实现对已有项目的定制化处理。

注意，一般要求 `/nop/autoconfig/xxx.beans` 与
`/xxx/xxx/beans/default.beans.xml` 在不同模块之间应该具备唯一性，
从而便于在 Delta 层对某个模块做差量处理，避免文件名称相同而无法定位差量：

```xml {3,7} title="_vfs/_delta/default/nop/web/beans/web-defaults.beans.xml"
<beans xmlns:x="/nop/schema/xdsl.xdef"
       x:schema="/nop/schema/beans.xdef"
       x:extends="super"
>

  <!-- 去掉 Nop 中不需要的 Beans -->
  <bean id="nopDynamicCssLoader" x:override="remove" />
  <!-- ... -->
</beans>
```

## Nop GraphQL 的使用 {#enable-nop-graphql}

> 需首先创建最小的 Quarkus 应用服务启动器。

在 `quarkus-starter` 模块中补充以下依赖：

```xml title="quarkus-starter/pom.xml"
  <!-- ... -->
  <dependencies>
    <!-- ... -->
    <dependency>
      <groupId>io.github.entropy-cloud</groupId>
      <artifactId>nop-graphql-core</artifactId>
    </dependency>

    <!-- 用于加载 @jakarta.ws.rs.Path 标注的 Web 端点:
    Nop GraphQL 端点需该组件的支持 -->
    <dependency>
      <groupId>io.quarkus</groupId>
      <artifactId>quarkus-resteasy</artifactId>
    </dependency>

    <!-- 用于提供 GraphiQL 控制台，并且其前端资源由依赖
    vertx-web-graphql 提供 -->
    <dependency>
      <groupId>io.quarkus</groupId>
      <artifactId>quarkus-vertx-graphql</artifactId>
      <exclusions>
        <exclusion>
          <groupId>com.graphql-java</groupId>
          <artifactId>graphql-java</artifactId>
        </exclusion>
      </exclusions>
    </dependency>
  </dependencies>
```

然后，将 Nop 平台中的以下 class 复制到 `quarkus-starter` 模块中：

- `QuarkusGraphQLWebService`：用于创建 `/graphql` 等 Web 端点

接着，在业务模块中添加 `nop-biz` 依赖，以支持提供 `@BizModel` 服务：

```xml title="pom.xml"
  <!-- ... -->
  <dependencies>
    <!-- ... -->
    <!-- 在需要启用 @BizModel 时，需引入该模块，否则，不能提供 GraphQL 服务 -->
    <dependency>
      <groupId>io.github.entropy-cloud</groupId>
      <artifactId>nop-biz</artifactId>
    </dependency>
  </dependencies>
```

最后，在业务模块中实现 `@BizModel` 模型的 `@BizQuery`
和 `@BizMutation` 接口：

```java title="WebPageProviderBizModel.java"
@BizModel("WebPageProvider")
public class WebPageProviderBizModel {

  @BizQuery
  public Map<String, Object> getPage(
    @Name("path") String path,
    IServiceContext context
  ) {
    return someData;
  }

  @BizMutation
  public void savePageSource(
    @Name("path") String path,
    @Name("data") Map<String, Object> data
  ) {
    // do something
  }
}
```

并在 `*.beans.xml` 中注册该模型的 Bean 即可：

```xml title="src/main/resources/_vfs/xxx/xxx/beans/default.beans.xml"
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:x="/nop/schema/xdsl.xdef" xmlns:ioc="ioc"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:schemaLocation="http://www.springframework.org/schema/beans
        http://www.springframework.org/schema/beans/spring-beans-2.5.xsd"
       x:schema="/nop/schema/beans.xdef"
>

  <bean id="webPageProviderBizModel"
        class="WebPageProviderBizModel"
  />
</beans>
```

在前端便可以调用该模型的接口：

```json title="/graphql"
{
  "query": "query WebPageProvider__getPage($path:String){\nWebPageProvider__getPage(path:$path)\n}",
  "variables": {
    "path": "/xxx/pages/Xxx/main.page.xml"
  }
}
```

## 自定义 DSL 模型加载器 {#custom-dsl-loader}

除了在代码中直接调用 `DslModelParser` 解析 DSL 模型以外，
还可以自定义 DSL 模型加载器，将特定后缀的 DSL 定义文件与其加载器进行绑定，
如此，便可以简单地调用 `IResourceComponentManager#loadComponentModel`
和 `IResourceComponentManager#parseComponentModel`
解析 DSL 文件并得到相应的 Java Class 对象。

> `IResourceComponentManager#loadComponentModel`
> 和 `IResourceComponentManager#parseComponentModel`
> 的功能相同，只是前者会按照 DSL 文件路径缓存解析结果，而后者则是实时解析的，
> 对结果不做缓存。

自定义的 DSL 模型加载器定义在 `src/main/resources/_vfs/nop/core/registry`
资源目录下的注册器定义文件中，该文件名称以 `.register-model.xml` 为后缀：

```xml {3,7,9,12} title="xweb.register-model.xml"
<model xmlns:x="/nop/schema/xdsl.xdef"
      x:schema="/nop/schema/register-model.xdef"
      name="xweb"
>

  <loaders>
    <xdsl-loader
        fileType="web.xml"
        schemaPath="/path/to/schema/web.xdef" />
    <loader
        fileType="site-html.xml"
        class="WebSiteHtmlLoader" />
  </loaders>
</model>
```

`model.name` 表示某类 DSL 模型加载器的名称，对于已缓存的 DSL 模型，
是按以该名称作为缓存分组，在同组内的 DSL 模型均会被缓存在同一个 Cache 中。
所以，为便于区分，一般要求不同类的 DSL 模型名称需具备唯一性，并且，
以该名称命名注册器定义文件名。

`xdsl-loader` 为通用的 DSL 模型加载器，仅需指定 DSL 文件后缀名和 Schema
路径即可，其解析结果与 `new DslModelParser().parseFromVirtualPath(path)`
是一样的。适用于不需要对解析结果做进一步转换处理的情况。

而 `loader` 可以指定自定义的加载器实现，以对 `DslModelParser`
的直接解析结果处理后再返回：

```java title="WebSiteHtmlLoader.java"
public class WebSiteHtmlLoader
      implements IResourceObjectLoader<WebSiteHtmlLoader.WebSiteHtml> {

  @Override
  public WebSiteHtml loadObjectFromPath(String path) {
    XNode node = XNodeParser.instance().parseFromVirtualPath(path);
    String xdefPath = node.attrText("x:schema");

    Object model = new DslModelParser(xdefPath).parseFromNode(node);
    XNode htmlNode = parseToHtmlNode(xdefPath, model);

    String html = htmlNode.html();
    html = StringHelper.unescapeXml(html);

    return new WebSiteHtml(path, html);
  }

  protected XNode parseToHtmlNode(String xdefPath, Object model) {
    return WebDslModelHelper.toHtmlNode(xdefPath, model);
  }

  public static class WebSiteHtml implements IComponentModel {
    private final String content;
    private final SourceLocation location;

    public WebSiteHtml(String path, String content) {
      this.content = content;
      this.location = SourceLocation.fromPath(path);
    }

    @Override
    public SourceLocation getLocation() {
      return this.location;
    }

    public String getContent() {
      return "<!DOCTYPE html>" + this.content;
    }
  }
}
```

> 加载器需实现 `IResourceObjectLoader` 接口，并且其最终解析结果必须是
> `IComponentModel` 类型的。

完成 DSL 模型加载器的注册后，便可以通过以下方式加载 DSL 文件：

```java
// 加载方式一：缓存解析结果
XWeb web = (XWeb) ResourceComponentManager
                    .instance()
                    .loadComponentModel("/path/to/xxx.web.xml");

// 加载方式二：不缓存解析结果
IResource resource = VirtualFileSystem
                        .instance()
                        .getResource("/path/to/xxx.site-html.xml");
WebSiteHtmlLoader.WebSiteHtml model =
        (WebSiteHtmlLoader.WebSiteHtml)
            ResourceComponentManager
                .instance()
                .parseComponentModel(resource);
```

DSL 模型加载器注册定义也同样支持差量，可通过 `fileType`
定位加载器并对其实施差量修订，从而支持以比代码更加灵活的方式进行定制化。

此外，在加载器注册定义文件中还可以配置 `transformer` 转换器：

```xml
  <transformers>
    <transformer
        target="xdef"
        class="io.nop.xlang.xmeta.impl.ObjMetaToXDef" />
  </transformers>
```

其用于将 `loader` 的 DSL 模型解析结果转换为 `target` 类型，
从而实现从一种模型到另一种模型的自动转换。

在 `IResourceComponentManager#loadComponentModel(String, String)`
和 `IResourceComponentManager#parseComponentModel(IResource, String)`
的第二参数中指定目标类型。也就是，通过 `loader` 解析得到第一个参数的 DSL
模型后，再根据第二个参数找到已注册的转换器，并调用该转换器，将
DSL 模型转换为目标模型：

```java
// IObjMeta -> IXDefinition
IXDefinition xdef =
    (IXDefinition) ResourceComponentManager
                      .instance()
                      .loadComponentModel(
                        "/nop/schema/xmeta.xdef",
                        "xdef"
                      );

// IXDefinition -> IObjMeta
// Note：其转换器定义在 XLangCoreInitializer#registerXDef 中
IObjMeta meta =
    (IObjMeta) ResourceComponentManager
                  .instance()
                  .loadComponentModel(
                    "/nop/schema/schema/schema.xdef",
                    "xmeta"
                  );
```

## 定制修改 xlib 函数 {#custom-xlib-function}

因为定制需求，现需要修改 xlib 库 `/nop/codegen/xlib/gen.xlib`
中的 `DefineLoopForOrm` 函数，以向构建器 `NestedLoopBuilder`
注入一个全局变量。

在 Nop 中，xlib 也是一个 xml 文件，也支持以差量方式进行定制，
但是，通过观察 `DefineLoopForOrm` 函数发现，其向构建器 `builder`
注入变量的地方发生在 `<c:script/>` 标签中：

```xml
    <DefineLoopForOrm>
      <!-- ... -->

      <source>
        <thisLib:DefineLoop>
          <c:script><![CDATA[
            // ...

            builder.defineGlobalVar("ormModel",ormModel);
            builder.defineGlobalVar("appName", appName);
            builder.defineGlobalVar("moduleId",moduleId);

            // ...
          ]]></c:script>
          <c:unit
              xpl:slot="default"
              xpl:slotArgs="{builder,ormModel,appName,moduleId}"
          />
        </thisLib:DefineLoop>
      </source>
    </DefineLoopForOrm>
```

也就是，最理想的定制方式，是在 `<c:script/>` 标签内追加对
`builder.defineGlobalVar` 的调用。

但是，Nop 的合并机制一般都是针对节点和节点属性的，其也支持合并文本内容吗？

答案是肯定的。

在 xml 中，节点内的文本，其本质也是一个节点（即文本节点），
因此，Nop 的差量合并策略对文本也同样有效。

不过，由于文本没有结构，无法对文本内容本身进行调整，
只能是在文本节点的前或后插入（`prepend`、`append`）新的文本。

> 可用的合并策略详见 `io.nop.xlang.xdef.XDefOverride`。

而针对当前场景需求的实现方案也只需要在 `DefineLoopForOrm` 函数的
`<c:script/>` 标签内追加一个文本节点，
并在该文本节点内编写变量注入的逻辑代码即可，不需要调整文本内容：

```xml {4,7-8,11} title="/nop/codegen/xlib/gen-ext.xlib"
<lib xmlns:x="/nop/schema/xdsl.xdef"
     xmlns:thisLib="thisLib" xmlns:c="c"
     x:schema="/nop/schema/xlib.xdef"
     x:extends="/nop/codegen/xlib/gen.xlib"
>
  <tags>
    <DefineLoopForOrm x:override="merge">
      <source x:override="merge">
        <thisLib:DefineLoop>
          <!-- 向原脚本内追加新代码 -->
          <c:script x:override="append"><![CDATA[
            let mavenArtifactId = ormModel['ext:mavenArtifactId'];

            builder.defineGlobalVar(
                'moduleClassShortPrefix',
                mavenArtifactId.replace('-','_').$camelCase(true)
            );
          ]]></c:script>
        </thisLib:DefineLoop>
      </source>
    </DefineLoopForOrm>
  </tags>
</lib>
```

> 若要支持扩展针对所有位置的调用均生效，则需要采用 delta 机制，在
> `_vfs/_delta` 层中扩展前一层的 `/nop/codegen/xlib/gen.xlib`，
> 也即，将 `x:extends` 的值设置为 `super`。

需要注意的是，除了在 `c:script` 标签上指定合并策略为
`append`（追加）以外，还必须在 `DefineLoopForOrm` 和 `source`
节点上指定合并策略为 `merge`，否则，其默认合并策略为 `replace`，
原函数的逻辑将被完全覆盖。

以上定制方式的最终合并结果为：

```xml {15-20}
    <DefineLoopForOrm>
      <!-- ... -->

      <source>
        <thisLib:DefineLoop>
          <c:script><![CDATA[
            // ...

            builder.defineGlobalVar("ormModel",ormModel);
            builder.defineGlobalVar("appName", appName);
            builder.defineGlobalVar("moduleId",moduleId);

            // ...

            let mavenArtifactId = ormModel['ext:mavenArtifactId'];

            builder.defineGlobalVar(
                'moduleClassShortPrefix',
                mavenArtifactId.replace('-','_').$camelCase(true)
            );
          ]]></c:script>
          <c:unit
              xpl:slot="default"
              xpl:slotArgs="{builder,ormModel,appName,moduleId}"
          />
        </thisLib:DefineLoop>
      </source>
    </DefineLoopForOrm>
```

从而，通过合并策略 `append` 便轻松实现了对原函数进行脚本内容的添加。
当然，若是对要调整原脚本的逻辑代码，则只能重写其脚本内容了。

## 规范化 JSON 类型字段的存取 {#standardize-json-field}

在 Nop 中，`stdDomain` 为 `json` 或 `tagSet` 包含 `json` 的字段都会绑定
`JsonOrmComponent` 类型的 ORM 组件：

```xml title="_dump/nop-app/xxx/xxx/orm/app.orm.xml"
    <entity name="SomeEntity" ...>
      <columns>
        <!-- ... -->

        <column
            code="OPTIONS" name="options"
            stdDomain="json" ... />
      </columns>
      <components>
        <!-- ... -->

        <component
            name="optionsComponent"
            className="io.nop.orm.component.JsonOrmComponent" ...>
          <prop name="_jsonText" column="options"/>
        </component>
      </components>

      <!-- ... -->
    </entity>
```

上例表示，为 JSON 类型字段 `OPTIONS` 绑定 `optionsComponent` 组件，
用于自动处理该字段的 JSON 序列化和反序列化。这样，便可以在前端直接与后端交互
JSON 对象，而不需要在前端重复处理对 JSON 类型属性的序列化和反序列化。

但是，Nop 并未限定 JSON 的结构，所以，需要在 XMeta 中按以下两种方式配置该属性：

```xml title="_vfs/xxx/xxx/SomeEntity/SomeEntity.xmeta"
    <!-- 方式一：设置 `optionsComponent` 组件的 GraphQL 类型为 `[Map]` -->
    <prop name="optionsComponent" graphql:type="[Map]" />

    <!--
    方式二：新增属性并映射到 `optionsComponent` 组件的内部结构上，
    同时设置其 GraphQL 类型为 `[Map]`
    -->
    <prop name="optionsData"
          mapToProp="optionsComponent.data"
          graphql:type="[Map]" />
```

> 配置 `graphql:type="[Map]"` 是为了让 Nop GraphQL 引擎能够对其按
> JSON 对象进行数据序列化和反序列化，若未指定，则默认按字符串处理。

采用方式一，可以不需要新增额外属性，直接复用字段的 JSON 组件即可，
但在该方式中，`optionsComponent` 是只读的，不能对其做修改操作。

而方式二则是新增了一个映射到 JSON 字段内部结构上的属性 `optionsData`，
对该属性进行修改时，Nop 会自动组装 JSON 对象为 `{data: ${optionsData}}`，
并将其序列化后的字符串存入 `OPTIONS` 字段中，重新读取 `optionsData`
时，Nop 则会自动从 `OPTIONS` 字段值中提取 JSON 对象中的`data` 键值到
`optionsData` 上。

> 方式二需确保引入了依赖 `io.github.entropy-cloud:nop-graphql-orm`，
> 否则，会报属性 `optionsData` 不存在的异常。

需要注意的是，虽然 `graphql:type` 被指定为 `[Map]`，
但并不表示 `optionsComponent.data` 的结构只能为 Object，
实际使用发现 List 集合也是能够正常处理的。

也就是，在具体的开发中，我们可以强制限定 JSON 字段的结构均采用
`{data: ...}` 形式，这样，仅需创建映射到该结构的 `data` 键值的属性即可。

需要指出的是，属性映射除了在 XMeta 中通过 `mapToProp` 指定外，还可以在
ORM 中通过别名 `alias` 定义：

```xml title="_vfs/xxx/xxx/orm/_app.orm.xml"
      <aliases>
        <alias name="optionsData"
                propPath="optionsComponent.data"
                tagSet="pub"
                type="Object" />
      </aliases>
```

在 ORM 中定义 JSON 字段结构的映射属性，可以对 ORM 之上的层隐藏对
JSON 的处理逻辑，使业务层能够完全专注于业务逻辑，而无需关注存储层的特殊处理。

> 在 XMeta 中依然需要在属性 `optionsData` 上显式设置
> `graphql:type="[Map]"`。

至此，可以确定针对 JSON 类型字段的规范化使用方案。这里依然假设存在
JSON 类型的字段 `OPTIONS`，需要在 ORM 之上的层中屏蔽其处理差异：

- 在 `app.orm.xml` 中，将 `OPTIONS` 的 `column#name`
  修改为 `optionsJsonText`，也即，在原始 `options` 上添加
  `JsonText` 后缀（注意，其 json 组件也会相应地更名为
  `optionsJsonTextComponent`）。再新增别名 `options`
  并设置其 `propPath` 为 `optionsJsonTextComponent.data`：

```xml title="_vfs/xxx/xxx/orm/app.orm.xml"
<?xml version="1.0" encoding="UTF-8" ?>
<orm xmlns:x="/nop/schema/xdsl.xdef"
      x:schema="/nop/schema/orm/orm.xdef"
      x:extends="_app.orm.xml"
>

  <entities>
    <entity name="SomeEntity">
      <columns>
        <column name="options" x:abstract="true" />
        <column name="optionsJsonText" x:prototype="options" />
      </columns>
      <aliases>
        <alias name="options"
                propPath="optionsJsonTextComponent.data"
                tagSet="pub"
                type="Object" />
      </aliases>
    </entity>
  </entities>
</orm>
```

- 在 xmeta 中，将 `options` 属性的 `graphql:type` 设置为 `[Map]`：

```xml title="_vfs/xxx/xxx/SomeEntity/SomeEntity.xmeta"
<?xml version="1.0" encoding="UTF-8" ?>
<meta xmlns:x="/nop/schema/xdsl.xdef"
      x:schema="/nop/schema/xmeta.xdef"
      x:extends="_DevAppDict.xmeta"
>

  <props>
    <prop name="options" x:override="replace"
          ext:kind="alias"
          graphql:type="[Map]" />
  </props>
</meta>
```

这样，从定义 ORM 模型到前端读写，都只需要处理 `options` 即可，
而不需要关心该字段存放在数据库中的真实结构，也不需要了解后端如何处理该字段的转换。

若是想让上述方案全局生效，则需要定制 Nop 的代码生成模板。
不过，由于代码生成模板都是 Xpl 脚本，无法做差量定制，只能在
delta 层对同名文件进行覆盖，可以点击
[json-standardize-template.delta.zip](./files/json-standardize-template.delta.zip)
下载该方案的定制模板，只需要将其解压到 codegen 模块的
`src/main/resources/_vfs` 资源目录下即可。

该模板主要对 `*.xmeta` 和 `_app.orm.xml` 的生成进行了处理以实现上述方案，
您可以通过 `diff` 获得与 `nop-codegen` 模块中的同名文件的差异以查看改动之处：

```diff title="{deltaDir}/_app.orm.xml.xgen"
@@ -5,6 +5,9 @@

     <gen:DslModelToXNode model="${ormModel}" defaultXdefPath="/nop/schema/orm/orm.xdef" xpl:return="ormNode"/>
     <c:script><![CDATA[
+        import java.util.ArrayList;
+        import io.nop.core.lang.xml.XNode;
+
 ormNode.removeAttr('ext:extends');
 ormNode.setAttr('xmlns:i18n-en','i18n-en');
 ormNode.setAttr('xmlns:ref-i18n-en','ref-i18n-en');
@@ -14,14 +17,36 @@
 ormNode.setAttr('xmlns:ui','ui');
 ormNode.prependBodyXml(`<x:post-extends x:override="replace"><orm-gen:DefaultPostExtends xpl:lib="/nop/orm/xlib/orm-gen.xlib" /></x:post-extends>`);
 ormNode.childByTag('entities')?.children?.forEach(entity=>{
+      const aliases = new ArrayList();
+
   entity.childByTag('columns')?.children?.forEach(col=>{
-     if(col.attrCsvSet('tagSet')?.contains('del')){
+      let jsonCol = col.attrCsvSet('tagSet')?.contains('json')
+                      || col.getAttr('stdDomain') == 'json';
+
+      if(col.attrCsvSet('tagSet')?.contains('del')){
         col.removeAttr('propId');
         col.setAttr('x:override','remove');
         col.setAttr('notGenCode',true);
-     }
+      }else if(jsonCol){
+        // 对 json 字段创建别名映射到其对应的 json 组件上，
+        // 从而在 biz 层屏蔽 orm 层的实现机制
+        const name = col.getAttr('name');
+        col.setAttr('name',name+'JsonText');
+
+        const alias = XNode.make('alias');
+        alias.setAttr('displayName',col.getAttr('displayName'));
+        alias.setAttr('name',name);
+        alias.setAttr('propPath',name+'JsonTextComponent.data');
+        alias.setAttr('tagSet','pub');
+        alias.setAttr('type','Object');
+        aliases.add(alias);
+      }
   });
+
+  if(!aliases.isEmpty()) {
+    entity.makeChild('aliases').appendChildren(aliases);
+  }
 });

 ]]></c:script>${ormNode.outerXml(false,false)}
-</c:unit>
\ No newline at end of file
+</c:unit>
```

```diff title="{deltaDir}/_{entityModel.shortName}.xmeta.xgen"
@@ -60,7 +60,9 @@
             <c:script><![CDATA[
                 // 是否是数据库列对应的增强对象
                 let colComp = entityModel.getComponent(col.name + "Component");
+                // json 字段不暴露给前端，采用 alias 方式屏蔽内部结构
                 let jsonCol = colComp != null && colComp.className.$simpleClassName() == 'JsonOrmComponent'
+                if (jsonCol) continue;
             ]]></c:script>
             <prop name="${col.name}" displayName="${col.displayName}" propId="${col.propId}"
                   i18n-en:displayName="${col['i18n-en:displayName']}" tagSet="${_.join(col.tagSet,',')}"
@@ -68,7 +70,6 @@
                   queryable="${col['ext:queryable'] ?? true}" sortable="${col['ext:sortable'] ?? true}"
                   insertable="${xpl('meta-gen:IsColInsertable',col)}" updatable="${xpl('meta-gen:IsColUpdatable',col)}"
                   internal="${xpl('meta-gen:IsColInternal',col)||null}"
-                  graphql:jsonComponentProp="${jsonCol? col.name + 'Component' : null}"
                   graphql:type="${col.primary and col.stdDataType.toString() == 'long' ? 'String':null}"
                   ui:show="${col['ui:show']}" ui:control="${col['ui:control'] || buildColControl(col)}"
                   biz:codeRule="${col?.tagSet?.contains('code')?entityModel.shortName+'@'+col.name:null}"
@@ -126,6 +127,9 @@
                 if(comp.name.endsWith("Component")){
                     compCol = entityModel.getColumn(comp.name.$removeTail("Component"),true);
                 }
+                // JsonOrmComponent 不暴露给前端，采用 alias 方式屏蔽内部结构
+                const jsonComp = comp.className.$simpleClassName() == 'JsonOrmComponent';
+                if (jsonComp) continue;
             ]]></c:script>
             <prop name="${comp.name}" displayName="${comp.displayName}"
                   i18n-en:displayName="${comp['i18n-en:displayName']}" tagSet="${_.join(comp.tagSet,',')}"
@@ -141,14 +145,21 @@
             <c:script>if(alias.tagSet?.contains('not-gen')) continue;
                 const insertable = !alias.tagSet?.contains('view');
                 const updatable = !alias.tagSet?.contains('view');
+                const queryable = alias.tagSet?.contains('pub');
+                // 对 json 字段，需显式设置 graphql:type="[Map]"
+                // 才能在前后端直接交换 JSON 对象，否则，只能交换字符串
+                const jsonAlias = alias.propPath.endsWith('JsonTextComponent.data');
             </c:script>
             <prop name="${alias.name}" displayName="${alias.displayName}"
                   i18n-en:displayName="${alias['i18n-en:displayName']}" tagSet="${_.join(alias.tagSet,',')}"
                   ext:kind="alias" internal="${alias.tagSet?.contains('sys')}" ui:control="${alias['ui:control']}"
-                  insertable="${insertable}" updatable="${updatable}"
+                  insertable="${insertable}" updatable="${updatable}" queryable="${queryable}"
                   mandatory="${alias.mandatory || null}" lazy="${alias.tagSet?.contains('eager')?false:true}"
-                  published="${alias.tagSet?.contains('not-pub') ? false : null}">
-                <schema type="${alias.javaTypeName}"/>
+                  published="${alias.tagSet?.contains('not-pub') ? false : null}"
+                  graphql:type="${jsonAlias ? '[Map]' : null}">
+                <c:if test="${!jsonAlias}">
+                    <schema type="${alias.javaTypeName}" />
+                </c:if>
             </prop>
         </c:for>

@@ -215,4 +226,4 @@
     </props>

     <meta-gen:GenMetaExt entityModel="${entityModel}" xpl:lib="/nop/codegen/xlib/meta-gen.xlib"/>
-</meta>
\ No newline at end of file
+</meta>
```

## 定制化 Nop 内置代码生成模板 {#custom-nop-codegen-template}

在 [规范化 JSON 类型字段的存取](#standardize-json-field) 章节的最后提到无法对
Nop 代码生成模板本身进行差量处理，因为它们都是无坐标的脚本代码，不能进行定点调整。

不过，我们仍然可以变换思路，从生成结果上入手，对结果做差量处理，从而实现我们的需求。

依然以 JSON 规范化存取章节的需求为例，可以在 `*.xmeta` 和 `_app.orm.xml`
的生成模板中，先拿到原始的生成结果，然后再对该结果做差量或其他处理。

得益于 Nop 的 delta 资源分层机制，我们仅需要在 delta 的 `default`
层（资源目录为 `/_vfs/_delta/default`）中对目标模板文件进行修改即可，
不需要复制其他模板文件。

先来看看如何修改 `_app.orm.xml` 的生成模板：

```xml {3,10-12,44} title="/_vfs/_delta/default/nop/templates/orm/{appName}-dao/src/main/resources/_vfs/{moduleId}/orm/{deltaDir}/_app.orm.xml.xgen"
<?xml version="1.0" encoding="UTF-8" ?>
<c:unit xmlns:c="c"xmlns:xpl="xpl"
  xpl:outputMode="text">

  <c:script><![CDATA[
      import java.util.ArrayList;
      import io.nop.core.lang.xml.XNode;
      import io.nop.codegen.XCodeGenerator;

      let xplPath = 'super:' + location().getPath();
      let xpl = XCodeGenerator.loadTpl(xplPath);
      let ormNode = xpl.generateToNode($scope);

      ormNode.childByTag('entities')?.children?.forEach(entity => {
        const aliases = new ArrayList();

        entity.childByTag('columns')?.children?.forEach(col => {
          let jsonCol = !col.attrCsvSet('tagSet')?.contains('del')
                          && (col.attrCsvSet('tagSet')?.contains('json')
                              || col.getAttr('stdDomain') == 'json');
          if (jsonCol) {
            // 对 json 字段创建别名映射到其对应的 json 组件上，
            // 从而在 biz 层屏蔽 orm 层的实现机制
            const name = col.getAttr('name');
            col.setAttr('name', name + 'JsonText');

            const alias = XNode.make('alias');
            alias.setAttr('displayName', col.getAttr('displayName'));
            alias.setAttr('name', name);
            alias.setAttr('propPath', name + 'JsonTextComponent.data');
            alias.setAttr('tagSet', 'pub');
            alias.setAttr('type', 'Object');

            aliases.add(alias);
          }
        });

        if (!aliases.isEmpty()) {
          entity.makeChild('aliases').appendChildren(aliases);
        }
      });
    ]]></c:script>

  ${ormNode.outerXml(false, false)}
</c:unit>
```

这里需要注意以下几点：

- 当前脚本的输出结果需设置为 `xpl:outputMode="text"`，因为该模板的输出结果为
  xml 文本，而不是 xml 节点
- `let xplPath = 'super:' + location().getPath();`
  表示取当前模板资源（通过 `location()` 得到当前代码位置信息）的上一 delta 层的模板资源，
  也就是复用 Nop 原始的生成逻辑
- 通过 `XCodeGenerator#loadTpl` 函数可以得到指定模板的解析对象（`XplModel`），
  再调用该对象的 `#generateToNode` 方法便可得到生成结果的 `XNode` 对象
- 在拿到原始生成结果后，便可以向该结果的 `XNode` 节点进行补充或删减操作
- 最后，通过调用 `ormNode.outerXml(false, false)` 输出调整后的 xml 内容即可

需要特别指出的是 `'super:' + location().getPath()` 的运行时结果为
`super:/_vfs/_delta/default/nop/templates/orm/{appName}-dao/src/main/resources/_vfs/{moduleId}/orm/{deltaDir}/_app.orm.xml.xgen`
，其中，`super:` 前缀表示取后面的指定 vfs（Nop 的虚拟文件系统）资源位置的上层
delta 资源，在该例中，就是取当前 delta 层标识为 `default` 的上一层资源，即
`/nop/templates/orm/{appName}-dao/src/main/resources/_vfs/{moduleId}/orm/{deltaDir}/_app.orm.xml.xgen`
，也就是 Nop 的原始生成模板。

接下来，再看看 `*.xmeta` 的生成模板的修改方式：

```xml {3,8-10,13-15,} title="/_vfs/_delta/default/nop/templates/meta/src/main/resources/_vfs/{moduleId}/model/{!entityModel.notGenCode}{entityModel.shortName}/{deltaDir}/_{entityModel.shortName}.xmeta.xgen"
<?xml version="1.0" encoding="UTF-8" ?>
<c:unit xmlns:c="c" xmlns:gen="gen" xmlns:xpl="xpl"
  xpl:outputMode="text">

  <c:script><![CDATA[
    import io.nop.codegen.XCodeGenerator;

    let xplPath = 'super:' + location().getPath();
    let xpl = XCodeGenerator.loadTpl(xplPath);
    let targetNode = xpl.generateToNode($scope);
  ]]></c:script>

  <gen:DeltaMerge targetNode="${targetNode}"
                  xpl:return="metaNode"
                  xpl:lib="/xxx/xxx/xlib/gen.xlib">
    <meta>
      <props>
        <!-- json 字段不暴露给前端（直接移除），采用 alias 方式屏蔽内部结构 -->
        <c:for var="col" items="${entityModel.columns}">
          <c:script><![CDATA[
            let colComp = entityModel.getComponent(col.name + "Component");
            let jsonCol =
                  colComp != null
                  && colComp.className.$simpleClassName()
                      == 'JsonOrmComponent'
          ]]></c:script>
          <c:if test="${jsonCol}">
            <prop name="${col.name}" x:override="remove" />
          </c:if>
        </c:for>
        <!-- JsonOrmComponent 不暴露给前端（直接移除），采用 alias 方式屏蔽内部结构 -->
        <c:for var="comp" items="${entityModel.components}">
          <c:script><![CDATA[
              if(comp.tagSet?.contains('not-gen')) continue;
              const jsonComp =
                      comp.className.$simpleClassName()
                        == 'JsonOrmComponent';
          ]]></c:script>
          <c:if test="${jsonComp}">
            <prop name="${comp.name}" x:override="remove" />
          </c:if>
        </c:for>

        <c:for var="alias" items="${entityModel.aliases}">
          <c:script><![CDATA[
            if(alias.tagSet?.contains('not-gen')) continue;

            const queryable = alias.tagSet?.contains('pub');
            // 对 json 字段，需显式设置 graphql:type="[Map]"
            // 才能在前后端直接交换 JSON 对象，否则，只能交换字符串
            const jsonAlias = alias.propPath.endsWith('JsonTextComponent.data');
          ]]></c:script>
          <prop name="${alias.name}"
                queryable="${queryable}"
                graphql:type="${jsonAlias ? '[Map]' : null}">
            <c:if test="${jsonAlias}">
              <schema x:override="remove" />
            </c:if>
          </prop>
        </c:for>
      </props>
    </meta>
  </gen:DeltaMerge>

  ${metaNode.outerXml(false, false)}
</c:unit>
```

与 `_app.orm.xml` 生成模板的改造不同，对 `*.xmeta`
生成模板的改造是采用 DSL 差量合并机制，而不是在代码中遍历修改节点。

xlib 函数 `gen:DeltaMerge` 将其子节点的构造结果与其参数
`targetNode` 做 `XNode` 合并，再将合并结果返回给变量
`metaNode`（`xpl:return="metaNode"`），最后，调用
`metaNode.outerXml(false, false)` 以输出最终的差量合并结果。

以下为 `gen:DeltaMerge` 函数的实现：

```xml {17,24} title="/xxx/xxx/xlib/gen.xlib"
<?xml version="1.0" encoding="UTF-8" ?>
<lib xmlns:x="/nop/schema/xdsl.xdef" xmlns:c="c"
      x:schema="/nop/schema/xlib.xdef">

  <tags>
    <DeltaMerge outputMode="none">
      <attr name="targetNode" type="io.nop.core.lang.xml.XNode" />

      <slot name="default" outputMode="node" />

      <source>
        <c:script><![CDATA[
          import io.nop.xlang.delta.DeltaMerger;
          import io.nop.xlang.xmeta.SchemaLoader;
          import io.nop.xlang.xdsl.XDslKeys;

          let deltaNode = eval_node(slot_default).child(0);

          let xdefPath = targetNode.getAttr('x:schema');
          let xdef = SchemaLoader.loadXDefinition(xdefPath);
          let keys = XDslKeys.of(targetNode);

          let merger = new DeltaMerger(keys);
          merger.merge(targetNode, deltaNode, xdef.getRootNode(), false);

          return targetNode;
        ]]></c:script>
      </source>
    </DeltaMerge>
  </tags>
</lib>
```

> 注意，`DeltaMerger#merge` 的合并结果不会主动删除 `x:override="remove"`
> 的节点，需要参考 `XDslValidator#clean` 的实现自行处理。
> 当然，也可以不用处理这些节点，在运行时的 DSL 中也会被移自动移除掉。

至此，我们通过两种实现方式，以最小化改造，完成了对 Nop 代码生成模板的定制。
当然，二者本质上是一样的，都是在原始生成结果上做定制处理，
因此，这一般仅针对生成结果为 xml 的情况，对于 java 代码等普通文本是没有合适的定制方案的。

## 根据名称合并 Xpl 标签 {#merge-xpl-tag-by-name}

> 还在整理中，以下仅为备忘内容。

适用于根据名称实现动态扩展支持的场景，比如，在 XMeta 中，根据 `domain`
名称展开特定的 `prop` 配置结构：

```xml title="/nop/core/xlib/meta-gen.xlib"
<lib>
  <tags>
    <GenPropForDomain outputMode="node">
      <attr name="_dsl_root" implicit="true"/>

      <source>
        <meta>
          <props>
            <c:for var="propNode" items="${_dsl_root.childByTag('props').children}">
              <c:script>
                import io.nop.xlang.xmeta.utils.ObjMetaPropHelper;
                const propGen = ObjMetaPropHelper.findTagForDomain(propNode);

                propGen?.executeWithArgs({propNode}, $evalRt);
              </c:script>
            </c:for>
          </props>
        </meta>
      </source>
    </GenPropForDomain>
  </tags>
</lib>
```

在 `ObjMetaPropHelper#findTagForDomain` 根据 `domain`
先找到对应的 Xpl 标签，如，`domain-csv-list`：

```xml title="/nop/core/xlib/meta-prop.xlib"
<lib>
  <tags>
    <domain-csv-list outputMode="node">
      <attr name="propNode"/>

      <source>
        <prop name="${propNode.getAttr('name')}">
          <schema type="List&lt;String>"/>

          <transformIn>
            return value?.$toCsvListString();
          </transformIn>

          <transformOut>
            return value?.$toCsvList();
          </transformOut>
        </prop>
      </source>
    </domain-csv-list>
  </tags>
</lib>
```

再调用 `propGen?.executeWithArgs({propNode}, $evalRt)`，从而生成由
`meta-prop:domain-csv-list` 构造的 `<prop />` 节点。

最终，`meta-gen:GenPropForDomain` 生成的 `<meta />`
再与 XMeta 根节点进行合并，从而实现根据名称动态查找并合并 Xpl 标签的目的。

## 注意事项 {#notes}

- `io.nop.xlang.delta.DeltaMerger` 执行 `x-extends` 算法，
  `io.nop.xlang.delta.DeltaDiffer` 执行 `x-diff` 算法，二者互为逆运算
- 可以通过实现 `IResourceNamespaceHandler` 的方式，
  自定义资源加载接口，从而实现对不同组织结构和方式的资源的加载
  - 在资源路径前添加前缀的方式识别，如 `delta_layer:/xx/xx/xx.xml`
  - 调用
    `VirtualFileSystem.instance().registerNamespaceHandler(IResourceNamespaceHandler)`
    进行注册
  - 通过 `io.nop.core.resource.store.VfsConfig#pathMappings`
    可以做虚拟路径转换，将 `_vfs` 下的文件隐射到其他目录下的同名文件（相对路径一致）
- 标准资源路径见: `docs/dev-guide/vfs/std-resource-path.md`
- `enum` 类型的使用方式还未确定，目前只支持使用枚举类型 `enum:io.xx.xx.Type`
- `io.nop.core.lang.eval.global.EvalGlobalRegistry#EvalGlobalRegistry`
  中定义了在 xpl 中可引用的全局变量
- 配置的加载逻辑在 `io.nop.config.starter.ConfigStarter#doStart`
  中，其支持从配置中心获取配置。可以通过激活的 profile 名称，创建不同环境的配置文件，如
  `application-dev.yaml`，其文件名为 `application-${profile}.yaml` 形式
- 在 `io.nop.biz.dev.DevDocBizModel` 中定义了配置、全局函数、Beans、GraphQL
  等数据的查看接口
  - 在配置 `nop.debug` 为 `true` 时才启用
  - 在 `/nop/biz/beans/biz-defaults.beans.xml` 中定义 Bean
- `io.nop.xlang.initialize.RegisterModelDiscovery#discover`
  会主动加载 `/nop/core/registry` 中的 `*.register-model.xml`
  模型注册器，在通过 `IResourceComponentManager#loadComponentModel`
  载入 DSL 时，将自动根据类型调用对应的加载器加载 DSL 模型
  - 该方式比调用 `IResourceComponentManager#registerComponentModelConfig`
    进行手工注册更具备灵活性和可扩展性
  - `transformer` 指定模型转换器，即，从一种 DSL 模型转换到另一种 DSL 模型，
    在调用 `IResourceComponentManager#loadComponentModel(String, String)`
    时，由第二参数指定要转换到的目标类型，而第一个参数为源模型的路径
  - 可以在一个注册器中注册多种模型的加载器，只是它们会被缓存在同一个 Cache 中
- `IResourceComponentManager#loadComponentModel` 与
  `IResourceComponentManager#parseComponentModel` 的功能相同，
  只是前者会缓存已加载和已转换的 DSL 模型，而后者不做缓存
- 可以通过 `x:post-extends` 在原 DSL 节点中注入多租户等扩展信息，
  从而可以以更加灵活的方式启用或禁用某些特性。在 `x:post-extends`
  上可通过 `x:override` 指定生成节点与当前 DSL 节点的合并策略
  - `x:post-extends` 只能定义在 DSL 根节点下，并且是针对整个 DSL
    做差量处理，不能定义在局部节点而对局部节点做差量。
    注：`x:gen-extends` 可以针对任意节点做差量
- 标注了 `@ApplicationScoped` 的类，其所在模块需启用 Maven 插件
  `org.jboss.jandex:jandex-maven-plugin`，否则，Quarkus 将不会加载该类
- 在 `io.nop.xlang.functions.GlobalFunctions` 中定义了 xpl 可访问的函数
- `io.nop.xlang.xdsl.DslModelHelper` 提供 DSL 模型与 XNode 的双向转换接口
- 在 `io.nop.core.lang.json.delta.DeltaMergeHelper#buildUniqueKey`
  中指定了 `id`、`name`、`x:id`、`v:id` 为默认的节点唯一属性，在节点上未通过
  `x:unique-attr` 指定唯一属性时，将按照默认的唯一属性做节点匹配
  - 唯一属性不存在时，按标签名匹配
