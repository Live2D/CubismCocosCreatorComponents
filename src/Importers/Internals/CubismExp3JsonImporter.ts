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
import CubismExpressionDataImporter from './CubismExpressionDataImporter';
import { existsFile } from './Utils';

const UTF8 = 'utf8';

export default class CubismExp3JsonImporter extends Importer {
  public get version() {
    return '1.0.0';
  }
  public get name() {
    return 'exp3.json';
  }
  public get assetType() {
    return 'CubismExpressionData';
  }

  public async validate(asset: VirtualAsset | Asset) {
    if (asset.isDirectory()) {
      return false;
    }

    const baseDir = Path.dirname(asset.source);
    const basenameExt = Path.basenameNoExt(asset.source);
    const basename = Path.basenameNoExt(basenameExt);
    const secondExt = Path.extname(basenameExt);

    if ('.exp3' != secondExt) {
      return false;
    }

    const outputFilePath = Path.join(
      baseDir,
      basename + `.${CubismExpressionDataImporter.extension}`
    );

    const jsonSrcJson = readFileSync(asset.source, UTF8);
    let needToCopy = false;
    if (existsFile(outputFilePath)) {
      const jsonSrcAsset = readFileSync(outputFilePath, UTF8);
      needToCopy = jsonSrcJson != jsonSrcAsset;
    } else {
      needToCopy = true;
    }
    if (!needToCopy) {
      return false;
    }

    writeFileSync(outputFilePath, jsonSrcJson);
    refresh(outputFilePath);

    return false;
  }

  public async import(asset: VirtualAsset | Asset): Promise<boolean> {
    // JsonAssetとしてインポートする都合上、常に validate が false を返すため実行されない。
    return false;
  }
}
