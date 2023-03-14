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
import { existsFile, registerImportTaskIfItCannotBeCoreInitialized } from './Utils';
import { ProjectModules } from '../../ProjectModules';
import CubismExpressionListImporter from './CubismExpressionListImporter';

const UTF8 = 'utf8';
const EXTENSION = 'exp3.asset';

export default class CubismExpressionDataImporter extends Importer {
  public static extension: typeof EXTENSION = EXTENSION;

  public get version() {
    return '1.0.0';
  }
  public get name() {
    return 'exp3.asset';
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

    const { default: CubismExpressionData } = await ProjectModules.getModule(
      'Framework/Expression/CubismExpressionData'
    );
    const { default: CubismExp3Json } = await ProjectModules.getModule(
      'Framework/Json/CubismExp3Json'
    );

    const jsonSrc = readFileSync(asset.source, 'utf8');
    const json = CubismExp3Json.loadFrom(jsonSrc);
    if (json == null) {
      console.error('CubismExp3Json.loadFrom() is failed.');
      return false;
    }
    const data = CubismExpressionData.createInstance(json);
    const serialized = EditorExtends.serialize(data);
    asset.saveToLibrary('.json', serialized);
    refresh(asset.source);

    const dirPath = Path.join(Path.dirname(asset.source), '../');
    const dirName = Path.basename(dirPath);
    if (dirPath.length == 0) {
      console.warn('CubismExpressionDataImporter.import(): Not subdirectory.');
      return true;
    }
    const expressionListFilePath = Path.join(
      dirPath,
      dirName + `.${CubismExpressionListImporter.extension}`
    );
    updateExpressionListFile(expressionListFilePath, asset.uuid);
    refresh(expressionListFilePath);
    return true;
  }
}

interface ICubismExpressionList {
  cubismExpressionObjects: string[];
}

function updateExpressionListFile(path: string, setUuid: string): void {
  let expressionList: ICubismExpressionList;
  if (existsFile(path)) {
    const source = readFileSync(path, UTF8);
    const json = JSON.parse(source);
    const cubismExpressionObjectsSource = Array.isArray(json.cubismExpressionObjects)
      ? (json.cubismExpressionObjects as any[])
      : undefined;
    if (cubismExpressionObjectsSource == null) {
      console.error('ExpressionList file parse error.');
      return;
    }
    const cubismExpressionObjects = purseCubismExpressionObjects(
      cubismExpressionObjectsSource,
      setUuid
    );
    if (cubismExpressionObjects == null) {
      console.error('ExpressionList file CubismExpressionObjects parse error.');
      return;
    }
    expressionList = { cubismExpressionObjects: cubismExpressionObjects };
  } else {
    expressionList = { cubismExpressionObjects: [setUuid] };
  }
  writeFileSync(path, JSON.stringify(expressionList), UTF8);
}

function purseCubismExpressionObjects(arr: any[], setUuid: string): string[] | null {
  let existsUuid = false;
  const result = new Array<string>(arr.length);
  for (let i = 0; i < result.length; i++) {
    const uuid =
      typeof arr[i] == 'string' && Editor.Utils.UUID.isUUID(arr[i])
        ? (arr[i] as string)
        : undefined;
    if (uuid == null) {
      return null;
    }
    if (uuid == setUuid) {
      existsUuid = true;
    }
    result[i] = uuid;
  }
  if (!existsUuid) {
    result.push(setUuid);
  }
  return result;
}
