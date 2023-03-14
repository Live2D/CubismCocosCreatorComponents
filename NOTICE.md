[English](NOTICE.md) / [中国語](NOTICE.cn.md) / [日本語](NOTICE.ja.md)

---

# Notices

## [Limitations]

## Drawing masks

Masks may not be drawn correctly immediately after loading Cubism SDK for Cocos Creator into Cocos Creator.
Also, when importing a model with clipping mask or mask inversion and previewing the scene, the texture used in the mask may be drawn in the entire scene.

### Workaround

#### If the mask is not rendered correctly

Make sure to re-import [GlobalMaskTexture.asset] using [Reimport Asset] and restart Cocos Creator.

#### When the texture used in the mask is drawn in the entire scene

In Cocos Creator, go to [Project]-[Project Settings]-[Layers] and give `User Layer 19` a name of your choice (e.g. MASK) and uncheck `Visibility` in the scene's Main Camera.
For details, please refer to the manual [Notes specific to Cocos Creator version].

## Add AnimationClip(State) to AnimationGraph (Added: 2023-03-14)

Currently, due to a limitation in Cocos Creator, it is not possible to add an AnimationClip set State to an AnimationGraph by drag and drop.

### Workaround

Right-click on the AnimationGraph edit screen, create a State, and then set the AnimationClip in the Inspector.


## Expression scene (Added: 2023-03-14)

After installing Cubism SDK for Cocos Creator, opening and building an Expression scene may not execute correctly.

### Workaround

Reimport the `Model\Natori\exp` folder and run the build.
* You may get an error when you Reimport, but the scene will run correctly.


## Exporting applications (Updated: 2023-03-14)

Cubism SDK for Cocos Creator R1 beta1 does not export to the following platforms.

* Windows
* Android

### Future

We will address this issue in the next and subsequent updates.


---

©Live2D
