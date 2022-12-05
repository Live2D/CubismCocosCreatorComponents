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

import type CubismExpressionData from '../../../static/assets/Framework/Expression/CubismExpressionData';
import { ProjectModules } from '../../ProjectModules';
import { registerImportTaskIfItCannotBeCoreInitialized } from './Utils';

const UTF8 = 'utf8';
const EXTENSION = 'expressionList.asset';

export default class CubismExpressionListImporter extends Importer {
  public static extension: typeof EXTENSION = EXTENSION;

  public get version() {
    return '1.0.0';
  }
  public get name() {
    return 'expressionList.asset';
  }
  public get assetType() {
    return 'CubismExpressionList';
  }

  public async validate(asset: VirtualAsset | Asset) {
    if (asset.isDirectory()) {
      return false;
    }
    if ('.expressionList' != Path.extname(Path.basenameNoExt(asset.source))) {
      return false;
    }
    return true;
  }

  public async import(asset: VirtualAsset | Asset): Promise<boolean> {
    if (!(await registerImportTaskIfItCannotBeCoreInitialized(asset.source))) {
      return false;
    }

    const { default: CubismExpressionData } = await ProjectModules.getModule(
      'Framework/Expression/CubismExpressionData'
    );
    const { default: CubismExpressionList } = await ProjectModules.getModule(
      'Framework/Expression/CubismExpressionList'
    );

    const source = JSON.parse(readFileSync(asset.source, UTF8));
    const expDataUuidsSource = Array.isArray(source.cubismExpressionObjects)
      ? (source.cubismExpressionObjects as any[])
      : undefined;
    if (expDataUuidsSource == null) {
      console.error('CubismExpressionListImporter.import(): parse error.');
      return false;
    }
    const expDataUuids = purseCubismExpressionObjects(expDataUuidsSource);
    if (expDataUuids == null) {
      console.error('CubismExpressionListImporter.import(): CubismExpressionObjects parse error.');
      return false;
    }
    const cubismExpressionObjects = new Array<CubismExpressionData>(expDataUuids.length);
    for (let i = 0; i < cubismExpressionObjects.length; i++) {
      const uuid = expDataUuids[i];
      // @ts-ignore
      cubismExpressionObjects[i] = EditorExtends.serialize.asAsset(
        uuid,
        CubismExpressionData
      ) as CubismExpressionData;
    }
    const list = new CubismExpressionList();
    list.cubismExpressionObjects = cubismExpressionObjects;
    await asset.saveToLibrary('.json', EditorExtends.serialize(list));
    return true;
  }
}

function purseCubismExpressionObjects(arr: any[]): string[] | null {
  const result = new Array<string>(arr.length);
  for (let i = 0; i < result.length; i++) {
    const uuid =
      typeof arr[i] == 'string' && Editor.Utils.UUID.isUUID(arr[i])
        ? (arr[i] as string)
        : undefined;
    if (uuid == null) {
      return null;
    }
    result[i] = uuid;
  }
  return result;
}
