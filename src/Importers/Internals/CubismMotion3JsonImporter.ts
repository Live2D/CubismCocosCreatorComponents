/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

import { readFileSync, writeFileSync } from 'fs';

const { Path } = Editor.Utils;

module.paths.push(Path.join(Editor.App.path, 'node_modules'));
import { Asset, Importer, refresh, VirtualAsset } from '@editor/asset-db';
import { ProjectModules } from '../../ProjectModules';
import CubismSDKSettings from '../../CubismSDKSettings';
import CubismFadeMotionDataImporter from './CubismFadeMotionDataImporter';
import CubismModel3JsonImporter from './CubismModel3JsonImporter';
import { AnimationClip, Asset as CCAsset } from 'cc';

const UTF8 = 'utf8';

export default class CubismMotion3JsonImporter extends Importer {
  public get version() {
    return '1.0.0';
  }
  public get name() {
    return 'motion3.json';
  }
  public get assetType() {
    return 'undefined';
  }

  public async validate(asset: VirtualAsset | Asset) {
    const ext = '.motion3';
    if (asset.isDirectory()) {
      return false;
    }

    const baseDir = Path.dirname(asset.source);
    const basenameExt = Path.basenameNoExt(asset.source);
    const basename = Path.basenameNoExt(basenameExt);
    const secondExt = Path.extname(basenameExt);

    if (ext != secondExt) {
      return false;
    }

    const { default: CubismMotion3Json } = await ProjectModules.getModule(
      'Framework/Json/CubismMotion3Json'
    );
    const { default: CubismFadeMotionData } = await ProjectModules.getModule(
      'Framework/MotionFade/CubismFadeMotionData'
    );

    const shouldImportAsOriginalWorkflow =
      await CubismSDKSettings.getShouldImportAsOriginalWorkflow();
    const shouldClearAnimationCurves = await CubismSDKSettings.getShouldClearAnimationCurves();

    const jsonSrc = readFileSync(asset.source, UTF8);
    const json = CubismMotion3Json.loadFrom(jsonSrc);
    if (json == null) {
      console.error('CubismMotion3Json.loadFrom() is failed.');
      return false;
    }

    const clipFilePath = Path.join(baseDir, basename + '.anim');
    const cfmdFilePath = Path.join(
      baseDir,
      basename + `.${CubismFadeMotionDataImporter.extension}`
    );

    const isCubismModelImport = CubismModel3JsonImporter.getMotionImportFlag(asset.source);

    let clip = new AnimationClip();
    const clipAsset = this.assetDB.path2asset.get(clipFilePath);
    if (clipAsset) {
      if (!clipAsset.invalid) {
        const clipJsonStr = readFileSync(clipAsset.source, UTF8);
        clip = CCAsset.deserialize(clipJsonStr) as AnimationClip;
      }
    }
    clip = json.toAnimationClipB(
      clip,
      shouldImportAsOriginalWorkflow,
      shouldClearAnimationCurves,
      isCubismModelImport
    );

    const serialized = EditorExtends.serialize(clip);
    asset.saveToLibrary('.json', serialized);
    writeFileSync(clipFilePath, serialized);

    // CubismFadeMotionData ファイル作成
    const data = CubismFadeMotionData.createInstance(json, asset.displayName, 0);
    const serializedData = JSON.stringify(data);
    writeFileSync(cfmdFilePath, serializedData);

    refresh(clipFilePath);
    refresh(cfmdFilePath);

    if (isCubismModelImport) {
      CubismModel3JsonImporter.clearMotionImportFlag(asset.source);
    }

    return false;
  }

  public async import(asset: VirtualAsset | Asset): Promise<boolean> {
    // JsonAssetとしてインポートする都合上、常に validate が false を返すため実行されない。
    return false;
  }
}
