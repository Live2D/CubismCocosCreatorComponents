[English](NOTICE.md) / [中国語](NOTICE.cn.md) / [日本語](NOTICE.ja.md)


---

# Notices

# [制限事項]

## マスクの描画

Cubism SDK for Cocos Creator を Cocos Creator に読み込んだ直後では正しくマスクが描画されない場合がございます。
また、クリッピングマスクやマスクの反転が使用されているモデルをインポートしシーンプレビューをおこなった際、シーン全体にマスクで使用しているテクスチャが描画される場合がございます。

### 対応策

#### 正しくマスクが描画されない場合

必ず[GlobalMaskTexture.asset]を[Reimport Asset]で再インポートし、Cocos Creatorを再起動してください。

#### シーン全体にマスクで使用しているテクスチャが描画される場合

Cocos Creatorの [Project]-[Project Settings]-[Layers]にございます`User Layer 19`に任意の名前(MASKなど)を付け、シーンのMain Cameraの`Visibility`からチェックを外してください。
詳しくはマニュアル [Cocos Creator版特有の注意点] をご確認ください。


## AnimationGraph に AnimationClip(State) を追加する (2023-03-14追加)

現在、Cocos Creator の制限により AnimationGraph に ドラッグ＆ドロップによって AnimationClip 設定済み State を追加できません。

### 対応策

AnimationGraph 編集画面を右クリックして State を作成後 Inspector より AnimationClip を設定して下さい。


## Expression シーン (2023-03-14追加)

Cubism SDK for Cocos Creator の導入作業後にExpressionシーンを開いてビルド実行すると、正しく実行できない場合があります。

### 対応策

`Model\Natori\exp` フォルダをReimportしてから実行してください。
* Reimportした際にエラーが出る場合がありますが、シーンは正しく実行できるようになります。


## アプリ書き出し (2023-03-14更新)

Cubism SDK for Cocos Creator R1 beta1 にて以下プラットフォーム書き出しができない現象がございます。

* Windows
* Android

### 今後について

次回以降の更新にて順次対応いたします。

---

©Live2D
