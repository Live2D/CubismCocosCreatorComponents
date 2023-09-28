[English](README.md) / [中国語](README.cn.md) / [日本語](README.ja.md)

---

# CubismCocosCreatorComponents

开放式组件，用于在应用程序中使用 Live2D Cubism Editor 输出的模型。

它提供各种显示和操作模型的功能。它与 Cubism Core 库结合使用，以加载模型。

要查找 SDK 软件包的下载页面，请访问 [下载页面](https://www.live2d.com/zh-CHS/download/cubism-sdk/download-cocoscreator/)。

## 许可证

使用前请阅读[LICENSE](LICENSE.md)。

## 通知

使用前请阅读[NOTICE](NOTICE.cn.md)。

## 与 Cubism 5 新功能和旧版本兼容

本 SDK 与 Cubism 5 兼容。 
请查看 [此处](https://docs.live2d.com/cubism-sdk-manual/cubism-5-new-functions/) SDK 与 Cubism 5 Editor 新功能的兼容性。 
关于与 Cubism SDK 先前版本的兼容性，请参阅 [此处](https://docs.live2d.com/cubism-sdk-manual/compatibility-with-cubism-5/)。


## 构造

### 组件

组件是按角色分组的，这种分组反映在文件夹结构和命名空间中。

#### Core wrapper

这一组的组件和类是将Cubism核心库包裹到TypeScript和Cocos Creator中的层，位于`./static/assets/Core`。

#### 框架

这一组的组件和class提供了额外的功能，如嘴型同步和Cocos Creator与Cubism文件的整合，以便嵌入。 所有的框架代码都可以在`./static/assets/Framework`中找到。

#### Rendering

该组的组件和class提供了使用Cocos Creator功能渲染Cubism模型的能力。 该代码可以在`./static/assets/Rendering`中找到。

### Editor扩展功能

Cocos Creator Editor扩展功能可以在`./src`找到。
将Cubism文件转换为prefabs和AnimationClips可在这里完成的。


### 资源

如着色器等资源，可以在`./static/assets/resources`中找到。

## 开发环境

| Cocos Creator | 版本 |
| --- | --- |
| 最新的 | v3.7.3 |

|工具 |版本 |
| --- | --- |
| Node.js | v20.7.0 |


##关于动作确认

1. 安装Node.js / npm。 （如果你已经安装了它请跳过）。

   - https://nodejs.org/en/

2. 启动Cocos Dashboard，通过选择\[Project\]-\[New\]-\[Empty(3D)\]创建一个项目。
3. 在创建了Cocos Creator项目后，从Cocos Creator菜单栏选择扩展管理器--扩展管理器--扩展管理器，打开扩展管理器窗口。
4. 在扩展管理器中按下顶部的\[Project\]标签后，点击右边的\[+\]按钮，选择下载的Cubism SDK for Cocos Creator的压缩文件。
5. 当扩展项出现时，点击文件夹图标，显示资源管理器。
6. 在出现的资源管理器中打开\[live2d_cubismsdk_cocoscreator\]文件夹。
7. 建立这个扩展项目。 (在CMD或其他控制台中使\[live2d_cubismsdk_cocoscreator\]文件夹处于当前状态并执行以下命令)

   1. npm install
   2. npm run build

8. 重新启动Cocos Creator并打开该项目。
9. 导入Cubism模型。

   - \*.moc3
   - \*.physics3.json
   - \*.cdi3.json
   - \*.pose3.json
   - [texture]
   - [motions]
   - \*.model3.json

   \*1 目前，不可能指定和控制导入顺序，第一次导入时可能会出现错误。

10. 导入后会生成 ＊＊.prefab.
11. 将导入生成的Prefab放到场景中。

### 文件夹结构示例。

```
CocosCreatorProject # Cocos Creator 中创建的项目
 ├─ assets
 ├─ library
 ├─ settings
 ├─ extensions
 │  ├─ live2d_cubism_sdk_for_cocos_extension # 项目的 extension 目录
 │  │  ├─ src
 │  │  ├─ dist # Build后的成果文件的导出路径
 │  │  ├─ static
  etc...
```

## Live2D official GitHub

如果你对Cubism SDK for Cocos Creator本有任何建议，请将它们发送到CubismCocosCreatorComponents仓库的issue或Pull Request。

- [CubismCocosCreatorComponents](https://github.com/Live2D/CubismCocosCreatorComponents)
- [Live2D GitHub](https://github.com/Live2D)

## 手册和教程

- [教程](https://docs.live2d.com/zh-CHS/cubism-sdk-tutorials/top/)
- [手册](https://docs.live2d.com/zh-CHS/cubism-sdk-manual/top/)

今后将增加中文的手册和教程。

## 用户论坛

- [官方Live2D用户论坛](https://creatorsforum.live2d.com/)
- [Live2D用户论坛（英文）](https://community.live2d.com/)
