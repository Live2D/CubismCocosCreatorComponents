/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

import { readFileSync, writeFileSync } from 'fs';
import { existsFile, registerImportTaskIfItCannotBeCoreInitialized } from './Utils';

const { Path } = Editor.Utils;

module.paths.push(Path.join(Editor.App.path, 'node_modules'));
import { Asset, Importer, VirtualAsset, refresh, reimport, queryUUID } from '@editor/asset-db';
import { Material, Texture2D, __private } from 'cc';

import { ProjectModules } from '../../ProjectModules';
import { generatePrefab } from '../../PrefabUtils';
import CubismMaterialPicker from '../../CubismMaterialPickerForImportersOnly';
import CubismTexturePickerForImportersOnly from '../../CubismTexturePickerForImportersOnly';
import CubismSDKSettings from '../../CubismSDKSettings';

import type CubismMoc from '../../../static/assets/Core/CubismMoc';
import CubismExpressionListImporter from './CubismExpressionListImporter';

const UTF8 = 'utf8';

export default class CubismModel3JsonImporter extends Importer {
  public get version() {
    return '1.0.0';
  }
  public get name() {
    return 'model3.json';
  }
  public get assetType() {
    return 'CubismMoc';
  }

  public async validate(asset: VirtualAsset | Asset) {
    const ext = '.model3';
    if (asset.isDirectory()) {
      return false;
    }
    if (ext != Path.extname(Path.basenameNoExt(asset.source))) {
      return false;
    }
    return true;
  }

  public async import(asset: VirtualAsset | Asset) {
    if (!(await registerImportTaskIfItCannotBeCoreInitialized(asset.source))) {
      return false;
    }

    const baseDir = Path.dirname(asset.source);

    //#region Import project module
    const { default: CubismModel3Json, CubismModelNodeGenerator } = await ProjectModules.getModule(
      'Framework/Json/CubismModel3Json'
    );
    const { default: CubismMoc } = await ProjectModules.getModule('Core/CubismMoc');
    //#endregion

    const shouldImportAsOriginalWorkflow =
      await CubismSDKSettings.getShouldImportAsOriginalWorkflow();

    //#region Read model3 json
    let model3JsonSource: string;
    try {
      model3JsonSource = readFileSync(asset.source, 'utf8');
    } catch (error) {
      console.error(error);
      return false;
    }
    let json: any;
    try {
      json = JSON.parse(model3JsonSource);
    } catch (error) {
      console.error(`Json parsing error.`);
      return false;
    }
    const model3 = CubismModel3Json.loadFromJson(json);
    if (model3 == null) {
      return false;
    }
    //#endregion

    const { fileReferences } = model3;
    const moc3Name = Path.basenameNoExt(fileReferences.moc);
    const outputFilePath = Path.join(baseDir, moc3Name + '.prefab');

    //#region Load Moc asset
    const mocAsset = this.assetDB.path2asset.get(Path.join(baseDir, fileReferences.moc));
    if (mocAsset == null) {
      return false;
    }
    if (!mocAsset.imported) {
      if (mocAsset.invalid) {
        // インポートに失敗している。
        return false;
      } else {
        // インポート処理されていないので遅延させて再実行
        window.setImmediate(() => {
          reimport(asset.source);
        });
        return false;
      }
    }
    // @ts-ignore
    const moc = EditorExtends.serialize.asAsset(mocAsset.uuid, CubismMoc) as CubismMoc;

    try {
      const binary = readFileSync(Path.join(baseDir, fileReferences.moc));
      Reflect.set(moc, '_bytes', binary);
    } catch (error) {
      console.error(error);
      return false;
    }
    //#endregion

    //#region Load texture assets
    const { textures: texturePaths } = fileReferences;
    const textures = new Array<Texture2D | null>(texturePaths.length);
    for (let i = 0; i < texturePaths.length; i++) {
      const texturePath = Path.join(baseDir, texturePaths[i]);
      const textureAsset = this.assetDB.path2asset.get(texturePath);
      if (textureAsset == null) {
        return false;
      }
      if (!textureAsset.imported) {
        if (textureAsset.invalid) {
          // インポートに失敗している。
          return false;
        } else {
          // インポート処理されていないので遅延させて再実行
          window.setImmediate(() => {
            reimport(asset.source);
          });
          return false;
        }
      }
      const uuid = getTextureUuid(textureAsset);
      if (uuid == null) {
        return false;
      }
      // @ts-ignore
      const rawAsset = EditorExtends.serialize.asAsset(uuid, Texture2D) as Texture2D;
      textures[i] = rawAsset;
    }
    //#endregion

    const { displayInfo, physics, pose, userData } = fileReferences;

    // Read DisplayInfoJson
    const displayInfoJson = physics ? readJsonFile(Path.join(baseDir, displayInfo)) : null;

    // Read Physics
    const physics3Json = physics ? readJsonFile(Path.join(baseDir, physics)) : null;

    // Read Pose
    const pose3Json = pose ? readJsonFile(Path.join(baseDir, pose)) : null;

    // Read UserData
    const userData3Json = userData ? readJsonFile(Path.join(baseDir, userData)) : null;

    //#region Read Motions
    for (const motion of fileReferences.motions.motions) {
      for (let i = 0; i < motion[1].length; i++) {
        const { file } = motion[1][i];
        const path = Path.join(baseDir, file);
        CubismModel3JsonImporter.motionImportFlags.set(path, true);
        setImmediate(() => reimport(path));
      }
    }
    const expListFilePath = Path.join(
      baseDir,
      Path.basename(baseDir) + `.${CubismExpressionListImporter.extension}`
    );
    const expListUuid = queryUUID(expListFilePath);
    const CubismExpressionList = (
      await ProjectModules.getModule('Framework/Expression/CubismExpressionList')
    ).default;
    // @ts-ignore
    const provisionalExpList = EditorExtends.serialize.asAsset(expListUuid, CubismExpressionList);
    //#endregion

    //#region Generate model
    const materialPicker = ImporterUtils.generateMaterialPicker();

    const model = await CubismModelNodeGenerator.generateModel({
      model3Json: model3,
      moc: moc,
      materialPicker: materialPicker.pick,
      texturePicker: new CubismTexturePickerForImportersOnly(textures).pick,
      displayInfo3Json: displayInfoJson,
      physics3Json: physics3Json,
      pose3Json: pose3Json,
      userData3Json: userData3Json,
      expList: provisionalExpList,
      shouldImportAsOriginalWorkflow: shouldImportAsOriginalWorkflow,
    });
    if (model == null) {
      console.error('CubismModelNodeGenerator.generateModel() failed.');
      return false;
    }
    //#endregion

    //#region Generate prefab
    const prefab = generatePrefab(model.node);
    const serialized = EditorExtends.serialize(prefab);
    await asset.saveToLibrary('.json', serialized);

    const prefabJson = JSON.parse(serialized);
    const prefabJsonStr = JSON.stringify(prefabJson);
    writeFileSync(outputFilePath, prefabJsonStr);
    asset.saveToLibrary('.json', prefabJsonStr);
    console.info(`CubismModel3JsonImporter.import(): Generate prefab '${outputFilePath}'.`);
    refresh(outputFilePath);
    //#endregion
    return true;
  }

  private static _motionImportFlags: Map<string, boolean> | null = null;

  private static get motionImportFlags(): Map<string, boolean> {
    if (!CubismModel3JsonImporter._motionImportFlags) {
      CubismModel3JsonImporter._motionImportFlags = new Map();
    }
    return CubismModel3JsonImporter._motionImportFlags;
  }

  public static getMotionImportFlag(path: string): boolean {
    return CubismModel3JsonImporter.motionImportFlags.get(path) ?? false;
  }

  public static clearMotionImportFlag(path: string): void {
    CubismModel3JsonImporter.motionImportFlags.delete(path);
  }
}

function readJsonFile(path: string): object | null {
  if (!existsFile(path)) {
    console.warn(`File not found. ${path}`);
    return null;
  }
  let str: string;
  try {
    str = readFileSync(path, UTF8);
  } catch (error) {
    console.error(error);
    return null;
  }
  try {
    const json = str != null ? JSON.parse(str) : null;
    return json == null ? null : json;
  } catch (error) {
    console.error(`Json parsing error. (${str})`);
    return null;
  }
}

function getTextureUuid(asset: Asset) {
  if (asset.meta.importer == 'texture') {
    return asset.uuid;
  }
  for (const key in asset.subAssets) {
    const subAsset = asset.subAssets[key];
    if (subAsset.meta.importer == 'texture') {
      return subAsset.uuid;
    }
  }
  return null;
}

namespace ImporterUtils {
  function getMaterial(uuid: string) {
    try {
      // @ts-ignore
      return EditorExtends.serialize.asAsset(uuid, Material) as Material;
    } catch (error) {
      console.error(error);
    }
    return null;
  }
  export function generateMaterialPicker() {
    const unlit = getMaterial('00f7219e-619d-4c04-855b-2eabb2e8bcc8');
    const unlitAdditive = getMaterial('8f4be102-82c3-414a-87b5-1d37d0334df9');
    const unlitAdditiveCulling = getMaterial('e1cb9114-4c37-437e-8195-8e118ef3d4ee');
    const unlitAdditiveMasked = getMaterial('1c73aed1-107f-47ef-a951-fc7918c199ad');
    const unlitAdditiveMaskedCulling = getMaterial('74f202c2-6acd-4cfe-8979-e86c785a4ccb');
    const unlitAdditiveMaskedInverted = getMaterial('627747c7-2390-4585-a070-b0832eef1544');
    const unlitAdditiveMaskedInvertedCulling = getMaterial('4fb0ddd5-1460-46d0-ac4e-7de80d58d6f7');
    const unlitCulling = getMaterial('79680d68-a3a9-4c37-9cdd-4192f1a2e90e');
    const unlitMasked = getMaterial('98e5d74e-fc60-43ba-8e80-233738ffcd49');
    const unlitMaskedCulling = getMaterial('b2895826-16c8-4cc3-8057-439e2d38ca00');
    const unlitMaskedInverted = getMaterial('742ada31-4256-4185-b94d-888d2398047d');
    const unlitMaskedInvertedCulling = getMaterial('06799f66-a91c-4e6b-95a4-282c959fd300');
    const unlitMultiply = getMaterial('7c3a25f5-2bc2-4911-adf7-47b62a434c75');
    const unlitMultiplyCulling = getMaterial('9cc9e566-ca39-450c-86f5-36191bd6a1ed');
    const unlitMultiplyMasked = getMaterial('a605be42-e807-4b8d-a0e4-712d0cca5a71');
    const unlitMultiplyMaskedCulling = getMaterial('5818c156-bdb1-41d9-9778-3142b93841dc');
    const unlitMultiplyMaskedInverted = getMaterial('970e7b69-ec3a-49bf-8daa-185db5a4ac58');
    const unlitMultiplyMaskedInvertedCulling = getMaterial('f3d8143c-79c1-4f7e-8f8e-10df323b0b5f');
    return new CubismMaterialPicker(
      unlit,
      unlitAdditive,
      unlitAdditiveCulling,
      unlitAdditiveMasked,
      unlitAdditiveMaskedCulling,
      unlitAdditiveMaskedInverted,
      unlitAdditiveMaskedInvertedCulling,
      unlitCulling,
      unlitMasked,
      unlitMaskedCulling,
      unlitMaskedInverted,
      unlitMaskedInvertedCulling,
      unlitMultiply,
      unlitMultiplyCulling,
      unlitMultiplyMasked,
      unlitMultiplyMaskedCulling,
      unlitMultiplyMaskedInverted,
      unlitMultiplyMaskedInvertedCulling
    );
  }
}
