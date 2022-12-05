/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

import { readFileSync } from 'fs';

const { Path } = Editor.Utils;

module.paths.push(Path.join(Editor.App.path, 'node_modules'));
import { Asset, Importer, VirtualAsset } from '@editor/asset-db';

import type CubismFadeMotionData from '../../../static/assets/Framework/MotionFade/CubismFadeMotionData';
import { ProjectModules } from '../../ProjectModules';
import { registerImportTaskIfItCannotBeCoreInitialized } from './Utils';
import { CubismFadeMotionListSerializedAsset } from '../../SerializedAssets/CubismFadeMotionListSerializedAsset';

const UTF8 = 'utf8';
const EXTENSION = 'fadeMotionList.asset';

export default class CubismFadeMotionListImporter extends Importer {
  public static extension: typeof EXTENSION = EXTENSION;

  public get version() {
    return '1.0.0';
  }
  public get name() {
    return 'fadeMotionList.asset';
  }
  public get assetType() {
    return 'CubismFadeMotionList';
  }

  public async validate(asset: VirtualAsset | Asset) {
    if (asset.isDirectory()) {
      return false;
    }
    if ('.fadeMotionList' != Path.extname(Path.basenameNoExt(asset.source))) {
      return false;
    }
    return true;
  }

  public async import(asset: VirtualAsset | Asset): Promise<boolean> {
    if (!(await registerImportTaskIfItCannotBeCoreInitialized(asset.source))) {
      return false;
    }

    const { default: CubismFadeMotionData } = await ProjectModules.getModule(
      'Framework/MotionFade/CubismFadeMotionData'
    );
    const { default: CubismFadeMotionList } = await ProjectModules.getModule(
      'Framework/MotionFade/CubismFadeMotionList'
    );

    const source = JSON.parse(readFileSync(asset.source, UTF8));
    const sList = CubismFadeMotionListSerializedAsset.instantiateFromJson(source);
    if (sList == undefined) {
      console.error('CubismFadeMotionListSerializedAsset parse error.');
      return false;
    }

    const cubismFadeMotionObjects = new Array<CubismFadeMotionData>(
      sList.cubismFadeMotionObjects.length
    );
    for (let i = 0; i < sList.cubismFadeMotionObjects.length; i++) {
      const uuid = sList.cubismFadeMotionObjects[i];
      // @ts-ignore
      cubismFadeMotionObjects[i] = EditorExtends.serialize.asAsset(
        uuid,
        CubismFadeMotionData
      ) as CubismFadeMotionData;
    }

    const list = new CubismFadeMotionList();
    list.cubismFadeMotionObjects = cubismFadeMotionObjects;
    list.motionInstanceIds = Array.from(sList.motionInstanceIds);

    await asset.saveToLibrary('.json', EditorExtends.serialize(list));
    return true;
  }
}
