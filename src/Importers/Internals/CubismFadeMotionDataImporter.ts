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
import CubismFadeMotionListImporter from './CubismFadeMotionListImporter';

const UTF8 = 'utf8';
const EXTENSION = 'fade.asset';

export default class CubismFadeMotionDataImporter extends Importer {
  public static extension: typeof EXTENSION = EXTENSION;

  public get version() {
    return '1.0.0';
  }
  public get name() {
    return 'fade.asset';
  }
  public get assetType() {
    return 'CubismFadeMotionData';
  }

  public async validate(asset: VirtualAsset | Asset) {
    if (asset.isDirectory()) {
      return false;
    }
    if ('.fade' != Path.extname(Path.basenameNoExt(asset.source))) {
      return false;
    }
    return true;
  }

  public async import(asset: VirtualAsset | Asset): Promise<boolean> {
    if (!(await registerImportTaskIfItCannotBeCoreInitialized(asset.source))) {
      return false;
    }

    const baseDir = Path.dirname(asset.source);
    const name = Path.basenameNoExt(asset.source);
    const outputFilePath = Path.join(baseDir, name + `.${EXTENSION}`);

    const { default: CubismFadeMotionData } = await ProjectModules.getModule(
      'Framework/MotionFade/CubismFadeMotionData'
    );

    const jsonSrc = readFileSync(asset.source, UTF8);
    const json = JSON.parse(jsonSrc);
    const data = CubismFadeMotionData.deserializeFromJson(json);
    const serialized = EditorExtends.serialize(data);
    asset.saveToLibrary('.json', serialized);
    refresh(outputFilePath);

    const dirPath = Path.join(Path.dirname(asset.source), '../');
    const dirName = Path.basename(dirPath);
    if (dirPath.length == 0) {
      console.warn('Not subdirectory.');
      return true;
    }

    const fadeMotionDataFilePath = Path.join(
      dirPath,
      `${dirName}.${CubismFadeMotionListImporter.extension}`
    );
    updateFadeMotionListFile(fadeMotionDataFilePath, asset.uuid);
    refresh(fadeMotionDataFilePath);
    return true;
  }
}

interface ICubismFadeMotionList {
  motionInstanceIds: number[];
  cubismFadeMotionObjects: string[];
}

function updateFadeMotionListFile(path: string, setUuid: string): void {
  // TODO: WIP
  let fadeMotionData: ICubismFadeMotionList;
  if (existsFile(path)) {
    const source = readFileSync(path, UTF8);
    const json = JSON.parse(source);
    const cubismFadeMotionObjectsSource = Array.isArray(json.cubismFadeMotionObjects)
      ? (json.cubismFadeMotionObjects as any[])
      : undefined;
    if (cubismFadeMotionObjectsSource == null) {
      console.error('FadeMotionList file parse error.');
      return;
    }
    const cubismFadeMotionObjects = purseCubismFadeMotionObjects(
      cubismFadeMotionObjectsSource,
      setUuid
    );
    if (cubismFadeMotionObjects == null) {
      console.error('FadeMotionList file CubismFadeMotionObjects parse error.');
      return;
    }
    // TODO: InstanceIds dummy.
    const motionInstanceIds = new Array<number>(cubismFadeMotionObjects.length);
    for (let i = 0; i < motionInstanceIds.length; i++) {
      motionInstanceIds[i] = 0;
    }
    fadeMotionData = {
      motionInstanceIds: motionInstanceIds,
      cubismFadeMotionObjects: cubismFadeMotionObjects,
    };
  } else {
    fadeMotionData = {
      motionInstanceIds: [0],
      cubismFadeMotionObjects: [setUuid],
    };
  }
  writeFileSync(path, JSON.stringify(fadeMotionData), UTF8);
}

function purseCubismFadeMotionObjects(arr: any[], setUuid: string): string[] | null {
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
