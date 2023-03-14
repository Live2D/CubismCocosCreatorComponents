[English](README.md) / [中国語](README.cn.md) / [日本語](README.ja.md)

---

# CubismCocosCreatorComponents

Cocos Creator用のCubismSDKのオープンコンポーネントです。

SDKパッケージのダウンロードページをお探しの場合は、[ダウンロードページ](https://docs.live2d.com/cubism-sdk-manual/download-sdk-for-cc-alpha/)にアクセスしてください。

## ライセンス

ご使用前に[ライセンス](LICENSE.md)をお読みください。

## お知らせ

ご使用前に[お知らせ](NOTICE.md)をお読みください。

## 構造

### コンポーネント

コンポーネントは役割ごとにグループ化されており、このグループ化はフォルダー構造と名前空間の両方に反映されます。

#### Coreラッパー

このグループのコンポーネントとクラスは、CubismコアライブラリをTypeScriptとCocos Creatorにラップするためのレイヤーであり、`./static/assets/Core`にあります。

#### フレームワーク

このグループのコンポーネントとクラスは、リップシンクやCubismの組み込み用ファイルとCocos Creatorの統合などの追加機能を提供します。すべてのフレームワークコードは`./static/assets/Framework`にあります。

#### レンダリング

このグループのコンポーネントとクラスは、Cocos Creatorの機能を使用してCubismモデルをレンダリングする機能を提供します。コードは、`./static/assets/Rendering`にあります。

### エディター拡張機能

Cocos Creator Editor拡張機能は、`./src` にあります。
CubismファイルをプレハブとAnimationClipに変換するのはここで行われます。

### リソース

シェーダー等のアセットのリソースは、`./static/assets/resources`にあります。

## 開発環境

| Cocos Creator | バージョン |
| --- | --- |
| latest | v3.7.1 |

| ツール | バージョン |
| --- | --- |
| Node.js | v19.1.0 |


## 動作確認について

1. Node.js / npm を インストール します。(インストール済みの場合は不要です。)

   - https://nodejs.org/en/

2. Cocos Dashboard を起動し、 \[Project\] - \[New\] - \[Empty(3D)\] で プロジェクト を作成します。
3. Cocos Creator プロジェクトが作成できたら、Cocos Creatorからメニューバーの \[Extension\] - \[Extension Manager\] を選択してExtension Managerウィンドウを開きます。
4. Extension Manager の上部 \[Project\] タブを押したあとに、右の \[+\] ボタンをクリックして、ダウンロードしたCubism SDK for Cocos Creatorのzipファイルを選択します。
5. Extensionの項目が表示されたら、フォルダアイコンをクリックしてエクスプローラを表示します。
6. 表示されたエクスプローラにある\[live2d_cubismsdk_cocoscreator\]フォルダを開きます。
7. 本 Extension プロジェクトをビルドします。(CMD 等の console で \[live2d_cubismsdk_cocoscreator\]フォルダをカレントにし、下記コマンドを実行)

   1. npm install
   2. npm run build

8. Cocos Creatorを再起動し、プロジェクトを開きます。
9. Cubism モデルをインポートします。

   - \*.moc3
   - \*.physics3.json
   - \*.cdi3.json
   - \*.pose3.json
   - [texture]
   - [motions]
   - \*.model3.json

   \*1 現状インポート順を指定制御できず、初回インポート時にエラーが発生することがありますので、その際はCubismモデルフォルダを Reimport するか、\*.model3.json を最後にインポートして下さい。

10. インポートにより \*.prefab が生成されます。
11. インポートにより生成された Prefab をシーンに配置します。

詳しくは、チュートリアルの\[SDK をインポート\]をご確認ください。

### ファイルフォルダ構成の例

```
CocosCreatorProject # Cocos Creator で作成したプロジェクト
 ├─ assets
 ├─ library
 ├─ settings
 ├─ extensions
 │  ├─ live2d_cubismsdk_cocoscreator # プロジェクトの extensions ディレクトリ
 │  │  ├─ src
 │  │  ├─ dist # ビルド後の成果ファイル出力先
 │  │  ├─ static
  etc...
```

## Live2D official GitHub
ご意見ご要望がございましたら、CubismCocosCreatorComponentsリポジトリのissueやPRにお寄せください。
- [CubismCocosCreatorComponents](https://github.com/Live2D/CubismCocosCreatorComponents)
- [Live2D GitHub](https://github.com/Live2D)

## マニュアル・チュートリアル
- [チュートリアル](https://docs.live2d.com/cubism-sdk-tutorials/top/)
- [マニュアル](https://docs.live2d.com/cubism-sdk-manual/top/)

## コミュニティ
- [Live2D 公式コミュニティ](https://creatorsforum.live2d.com/)
- [Live2D community (English)](https://community.live2d.com/)
