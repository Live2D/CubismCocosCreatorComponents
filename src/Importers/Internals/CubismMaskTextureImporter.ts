/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

import { readFileSync, writeFileSync } from 'fs';

const { Path } = Editor.Utils;

module.paths.push(Path.join(Editor.App.path, 'node_modules'));
import { Asset, Importer, VirtualAsset } from '@editor/asset-db';
import { ProjectModules } from '../../ProjectModules';
import { registerImportTaskIfItCannotBeCoreInitialized } from './Utils';

const UTF8 = 'utf8';
const EXTENSION = 'asset';

export default class CubismMaskTextureImporter extends Importer {
  public static extension: typeof EXTENSION = EXTENSION;

  public get version() {
    return '1.0.0';
  }
  public get name() {
    return 'asset';
  }
  public get assetType() {
    return 'CubismMaskTexture';
  }
  public async validate(asset: VirtualAsset | Asset) {
    if (asset.isDirectory()) {
      return false;
    }
    try {
      const str = readFileSync(asset.source, UTF8);
      const json = JSON.parse(str);
      return json.type == 'CubismMaskTexture';
    } catch (error) {}
    return false;
  }

  public async import(asset: Asset) {
    if (!(await registerImportTaskIfItCannotBeCoreInitialized(asset.source))) {
      return false;
    }

    const { default: CubismMaskTexture } = await ProjectModules.getModule(
      'Rendering/Masking/CubismMaskTexture'
    );

    const jsonSource = readFileSync(asset.source, UTF8);
    const json = parse(jsonSource);
    if (json == null) {
      return false;
    }

    // インスペクターからの編集か確認
    const fromInspector = getUserDataFromInspector(asset.userData);
    if (fromInspector != null) {
      writeFileSync(
        asset.source,
        JSON.stringify({
          type: 'CubismMaskTexture',
          size: fromInspector.size,
          subdivisions: fromInspector.subdivisions,
        }),
        UTF8
      );
      json.size = fromInspector.size;
      json.subdivisions = fromInspector.subdivisions;
      Reflect.deleteProperty(asset.userData, 'fromInspector');
    }

    const nAsset = CubismMaskTexture.generateCubismMaskTexture(json.size, json.subdivisions);
    if (nAsset == null) {
      console.error('CubismMaskTexture.generateCubismMaskTexture() failed.');
      return false;
    }

    nAsset.name = asset.basename;
    const content = EditorExtends.serialize(nAsset);
    await asset.saveToLibrary('.json', content);
    return true;
  }
}

interface ICubismMaskTextureProperties {
  size: number;
  subdivisions: number;
}

function getUserDataFromInspector(obj: any): ICubismMaskTextureProperties | undefined {
  const fromInspector = Reflect.get(obj, 'fromInspector');
  if (fromInspector == null) {
    return undefined;
  }
  const size = Reflect.get(fromInspector, 'size');
  const subdivisions = Reflect.get(fromInspector, 'subdivisions');
  if (Number.isInteger(size) && Number.isInteger(subdivisions)) {
    return { size: size, subdivisions: subdivisions };
  }
  console.error('Internal error.');
  return undefined;
}

function parse(source: string): ICubismMaskTextureProperties | null {
  let json: any;
  try {
    json = JSON.parse(source);
  } catch (error) {
    if (error instanceof SyntaxError) {
      console.error(error.message);
      return null;
    } else {
      throw error;
    }
  }
  if (!Number.isInteger(json.size)) {
    console.error('Json parsing error.');
    return null;
  }
  const size = json.size as number;
  if (!Number.isInteger(json.subdivisions)) {
    console.error('Json parsing error.');
    return null;
  }
  const subdivisions = json.subdivisions as number;
  if (1 > subdivisions || subdivisions > 5) {
    console.error('Json parsing error.');
    return null;
  }
  return { size: size, subdivisions: subdivisions };
}
