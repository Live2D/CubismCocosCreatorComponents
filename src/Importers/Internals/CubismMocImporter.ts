/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

const { Path } = Editor.Utils;
module.paths.push(Path.join(Editor.App.path, 'node_modules'));
import { Asset, Importer, VirtualAsset } from '@editor/asset-db';
import { ProjectModules } from '../../ProjectModules';
import { registerImportTaskIfItCannotBeCoreInitialized } from './Utils';

export default class Live2DCubismMocImporter extends Importer {
  public get version() {
    return '1.0.0';
  }
  public get name() {
    return 'moc3';
  }
  public get assetType() {
    return 'CubismMoc';
  }
  public async validate(asset: VirtualAsset | Asset) {
    return !asset.isDirectory() && asset instanceof Asset;
  }

  public async import(asset: VirtualAsset | Asset) {
    if (!(await registerImportTaskIfItCannotBeCoreInitialized(asset.source))) {
      return false;
    }
    const extname = '.bin';
    const basename = Path.basename(asset.source);

    const { default: CubismMoc } = await ProjectModules.getModule('Core/CubismMoc');

    await asset.copyToLibrary(extname, asset.source);
    const nAsset = new CubismMoc();
    nAsset.name = basename;
    nAsset._setRawAsset(extname);

    const content = EditorExtends.serialize(nAsset);
    await asset.saveToLibrary('.json', content);
    return true;
  }
}
