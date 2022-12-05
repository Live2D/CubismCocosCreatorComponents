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
import CubismExpressionDataImporter from './CubismExpressionDataImporter';
import { registerImportTaskIfItCannotBeCoreInitialized } from './Utils';

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
    if ('.exp3' != Path.extname(Path.basenameNoExt(asset.source))) {
      return false;
    }
    return true;
  }

  public async import(asset: VirtualAsset | Asset): Promise<boolean> {
    if (!(await registerImportTaskIfItCannotBeCoreInitialized(asset.source))) {
      return false;
    }

    const baseDir = Path.dirname(asset.source);
    const name = Path.basenameNoExt(Path.basenameNoExt(asset.source));
    const outputFilePath = Path.join(baseDir, name + `.${CubismExpressionDataImporter.extension}`);

    const { default: CubismExpressionData } = await ProjectModules.getModule(
      'Framework/Expression/CubismExpressionData'
    );
    const { default: CubismExp3Json } = await ProjectModules.getModule(
      'Framework/Json/CubismExp3Json'
    );

    const jsonSrc = readFileSync(asset.source, UTF8);
    const json = CubismExp3Json.loadFrom(jsonSrc);
    if (json == null) {
      console.error('CubismExp3Json.loadFrom() is failed.');
      return false;
    }
    const data = CubismExpressionData.createInstance(json);
    const serialized = EditorExtends.serialize(data);
    writeFileSync(outputFilePath, jsonSrc);
    asset.saveToLibrary('.json', serialized);
    refresh(outputFilePath);
    return true;
  }
}
