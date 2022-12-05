[English](NOTICE.md) / [中国語](NOTICE.cn.md) / [日本語](NOTICE.ja.md)

---

# Notices

## [Alpha version limitations]

## Motion and MotionFade components

Currently, the motion playback and fade functions only support animation playback using Cocos Creator's Animation and AnimationClip, and there is no function to play and fade an animation separately from the one currently playing.

There is no function to playback animation without Animation and AnimationClip.

### Future actions

We plan to implement alternative functions in the beta version or later.


## Playback animation using AnimationGraph

Animation transitions and playback using AnimationGraph and AnimationClip converted from .motion3.json are not supported.

### Future actions

This is a specification for Cocos Creator 3.
Support has not yet been determined.


## Drawing masks

Masks may not be drawn correctly immediately after loading Cubism SDK for Cocos Creator into Cocos Creator.
Also, when importing a model with clipping mask or mask inversion and previewing the scene, the texture used in the mask may be drawn in the entire scene.

### Workaround

#### If the mask is not rendered correctly

Make sure to re-import [GlobalMaskTexture.asset] using [Reimport Asset] and restart Cocos Creator.

#### When the texture used in the mask is drawn in the entire scene

In Cocos Creator, go to [Project]-[Project Settings]-[Layers] and give `User Layer 19` a name of your choice (e.g. MASK) and uncheck `Visibility` in the scene's Main Camera.
For details, please refer to the manual [Notes specific to Cocos Creator version].


## Scene View

An error occurs when Undo is executed after the model is displayed in scene view and any drawable coordinates are moved.
This error does not occur when moving the coordinates of the entire model.

### Future actions

We plan to fix this issue in the next alpha release. Please wait for the next release.


## Exporting apps

Application export (Build) failed with an error and the application cannot be exported.

### Future actions

We are planning to fix this issue for Web Desktop in the next alpha release. Please wait for our response.
Major export destinations (Windows, Android, Web Mobile, etc.) will be supported in the beta version or later.
Other export destinations are under consideration.

---

©Live2D
