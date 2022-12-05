[English](NOTICE.md) / [中国語](README.cn.md) / [日本語](NOTICE.ja.md)

---

# Notices

## [alpha版的限制事项]

### 关于Motion和MotionFade组件

关于动作（Motion）播放和渐变（Fade）功能，目前只支持使用Cocos Creator中的Animation和AnimationClip播放的动画，另外，暂时没有功能可支持在当前播放的动画上，播放和淡入淡出其他动画。

另外，不使用Animation和AnimationClip的情况下播放动画的功能也仍未实装。


#### 关于今后的展开

预定在beta版以后实装替代的功能。


## 使用AnimationGraph播放动画

不支持使用从.motion3.json转换的AnimationGraph和AnimationClip的动画过渡和播放。

### 关于今后的展开

目前版本为Cocos Creator 3规格。
关于今后的规格仍然未定。


## 蒙版绘制

将Cubism SDK for Cocos Creator加载到Cocos Creator后，可能出现无法立即正常地绘制蒙版的情况。
另外，当导入带有剪切蒙版或蒙版反转的模型并预览场景时，蒙版中使用的纹理可能会被绘制到整个场景中。


### 解决方法

#### 如果无法正常地进行蒙版的绘制

请务必在[Reimport Asset]把[GlobalMaskTexture.asset]重新导入，然后重启Cocos Creator。

#### 如果蒙版中使用的纹理被绘制到整个场景中

Cocos Creator的 [Project]-[Project Settings]-[Layers]中，为`User Layer 19`以任意名称命名(例如MASK)，然后取消场景的Main Camera的`Visibility`的对钩选择。

详细请查阅使用手册中的 [Cocos Creator版的特别注意点] 。


## 场景视图

在模型显示在场景视图，并移动任意Drawable坐标后，执行Undo撤消操作时会发生错误。
在移动整个模型的坐标时，不会出现这种情况。


### 关于今后的展开

预定在今后发布的alpha版本中进行各种修正。请大家耐心等待后续更新。


## 关于应用程序的导出

当前在应用程序导出（Build）中发生了一个错误，会导致无法执行应用程序导出。

### 关于今后的展开

计划在今后发布的alpha版本中对Web Desktop进行修复。请大家耐心等待后续更新。
beta版以后，计划主要会对应面向(Windows,Android,Web Mobile等等)的导出。关于其他平台的导出还在讨论中。


---

©Live2D
