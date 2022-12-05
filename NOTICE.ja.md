[English](NOTICE.md) / [中国語](NOTICE.cn.md) / [日本語](NOTICE.ja.md)


---

# Notices

# [alpha版制限事項]

## Motion 及び MotionFade コンポーネント

現在モーション再生機能及びフェード機能において、Cocos CreatorのAnimationとAnimationClipを使用したアニメーション再生のみに対応し、再生中のアニメーションに別にアニメーションを再生させてフェードするような機能はございません。

また、 AnimationとAnimationClip を用いずにアニメーションを再生するための機能もございません。

### 今後について

beta版以降にて代替の機能を実装する予定です。


## AnimationGraphを使用したアニメーション再生

AnimationGraphと.motion3.jsonから変換されたAnimationClipを用いたアニメーション遷移や再生には対応しておりません。

### 今後について

Cocos Creator 3 の仕様となります。
対応についても未定となります。


## マスクの描画

Cubism SDK for Cocos Creator を Cocos Creator に読み込んだ直後では正しくマスクが描画されない場合がございます。
また、クリッピングマスクやマスクの反転が使用されているモデルをインポートしシーンプレビューをおこなった際、シーン全体にマスクで使用しているテクスチャが描画される場合がございます。

### 対応策

#### 正しくマスクが描画されない場合

必ず[GlobalMaskTexture.asset]を[Reimport Asset]で再インポートし、Cocos Creatorを再起動してください。

#### シーン全体にマスクで使用しているテクスチャが描画される場合

Cocos Creatorの [Project]-[Project Settings]-[Layers]にございます`User Layer 19`に任意の名前(MASKなど)を付け、シーンのMain Cameraの`Visibility`からチェックを外してください。
詳しくはマニュアル [Cocos Creator版特有の注意点] をご確認ください。


## シーンビュー

シーンビューにてモデルを表示し、任意のDrawable座標を動かしたあとにUndoを実行するとエラーが発生します。
モデル全体の座標を動かす場合は発生いたしません。

### 今後について

次回以降のalpha版リリースにて修正を予定しております。対応をお待ちください。


## アプリ書き出し

アプリ書き出し(Build)において、エラーが発生しアプリ書き出しがおこなえません。

### 今後について

次回以降のalpha版リリースにてWeb Desktopに対して修正を予定しております。対応をお待ちください。
また、beta版以降にて主要な書き出し先(Windows,Android,Web Mobileなど)に対応予定です。
その他の書き出し先については検討中となります。



---

©Live2D
