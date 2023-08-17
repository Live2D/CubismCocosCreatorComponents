[English](NOTICE.md) / [中国語](README.cn.md) / [日本語](NOTICE.ja.md)

---

# Notices

## [限制事项]

## 蒙版绘制

将Cubism SDK for Cocos Creator加载到Cocos Creator后，可能出现无法立即正常地绘制蒙版的情况。
另外，当导入带有剪切蒙版或蒙版反转的模型并预览场景时，蒙版中使用的纹理可能会被绘制到整个场景中。


### 解决方法

#### 如果无法正常地进行蒙版的绘制

请务必在[Reimport Asset]把[GlobalMaskTexture.asset]重新导入，然后重启Cocos Creator。

#### 如果蒙版中使用的纹理被绘制到整个场景中

Cocos Creator的 [Project]-[Project Settings]-[Layers]中，为`User Layer 19`以任意名称命名(例如MASK)，然后取消场景的Main Camera的`Visibility`的对钩选择。

详细请查阅使用手册中的 [Cocos Creator版的特别注意点] 。


## Animation curves (添加: 2023-08-17)

目前，在导入 Animation curves 设置为 `stepped` 的 `.motion3.json` 文件时，我们已确认存在 `stepped` 无法重现的现象。
这个问题将在下一次更新中解决，请耐心等待。


## 将AnimationClip(State)添加到AnimationGraph中 (添加: 2023-03-14)

由于Cocos Creator的限制，不可能通过拖放将配置好的AnimationClip State添加到AnimationGraph中。

### 解决方法

在AnimationGraph编辑界面上点击右键，创建一个State，然后在检查器中设置AnimationClip。


## 表达式场景 (添加: 2023-03-14)

安装Cubism SDK for Cocos Creator后，打开和建立一个Expression场景可能无法正确执行。

### 解决方法。

重新导入`Model\Natori\exp`文件夹并运行构建。
* 当你重新导入时，你可能会得到一个错误，但场景会正确运行。


## 导出应用程序（更新: 2023-08-17）

Cubism SDK for Cocos Creator R1 beta1不能导出到以下平台。

* Android

### 未来

我们将在下一次及以后的更新中解决这个问题。


---

©Live2D
