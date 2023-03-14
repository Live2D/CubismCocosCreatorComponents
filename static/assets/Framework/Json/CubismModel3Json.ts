/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

import {
  animation,
  Asset,
  BufferAsset,
  CCInteger,
  JsonAsset,
  Material,
  path,
  resources,
  Texture2D,
  _decorator,
} from 'cc';
import CubismMoc from '../../Core/CubismMoc';
import CubismModel from '../../Core/CubismModel';
import CubismRenderController from '../../Rendering/CubismRenderController';
import CubismMaskController from '../../Rendering/Masking/CubismMaskController';
import { ArrayExtensions, isNullOrEmpty } from '../../Utils';
import CubismDisplayInfoParameterName from '../CubismDisplayInfoParameterName';
import CubismDisplayInfoPartName from '../CubismDisplayInfoPartName';
import CubismEyeBlinkController from '../CubismEyeBlinkController';
import CubismEyeBlinkParameter from '../CubismEyeBlinkParameter';
import CubismHitDrawable from '../CubismHitDrawable';
import CubismParameterStore from '../CubismParameterStore';
import CubismUpdateController from '../CubismUpdateController';
import CubismExpressionController from '../Expression/CubismExpressionController';
import CubismFadeController from '../MotionFade/CubismFadeController';
import CubismMouthController from '../MouthMovement/CubismMouthController';
import CubismMouthParameter from '../MouthMovement/CubismMouthParameter';
import CubismPhysicsController from '../Physics/CubismPhysicsController';
import CubismPoseController from '../Pose/CubismPoseController';
import CubismRaycastable from '../Raycasting/CubismRaycastable';
import CubismUserDataTag from '../UserData/CubismUserDataTag';
import CubismUserDataTargetType from '../UserData/CubismUserDataTargetType';
import CubismDisplayInfo3Json from './CubismDisplayInfo3Json';
import CubismExp3Json from './CubismExp3Json';
import CubismPhysics3Json from './CubismPhysics3Json';
import CubismPose3Json from './CubismPose3Json';
import CubismUserData3Json from './CubismUserData3Json';
import CubismBuiltinPickers from './CubismBuiltinPickers';
import JsonParseUtils from './JsonParseUtils';
import CubismParametersInspector from '../CubismParametersInspector';
import CubismPartsInspector from '../CubismPartsInspector';
import CubismPosePart from '../Pose/CubismPosePart';
import ArrayExtensionMethods from '../../Core/ArrayExtensionMethods';
import type CubismRenderer from '../../Rendering/CubismRenderer';
import type CubismExpressionList from '../Expression/CubismExpressionList';
import type CubismParameter from '../../Core/CubismParameter';
import type CubismUserDataBody from '../UserData/CubismUserDataBody';
import type CubismDrawable from '../../Core/CubismDrawable';
import type IStructLike from '../../IStructLike';
import { EDITOR } from 'cc/env';
const { property } = _decorator;

//#region Delegates
namespace CubismModel3Json {
  /**
   * Handles the loading of assets.
   *
   * @param assetType The asset type to load.
   * @param assetPath The path to the asset.
   * @returns
   */
  export type LoadAssetAtPathHandler<T extends Asset = Asset> = (
    assetPath: string,
    constructor: new (...args: any[]) => T
  ) => Promise<T | null>;

  /**
   * Picks a Material for a CubismDrawable.
   *
   * @param sender Event source.
   * @param drawable Drawable to pick for.
   * @returns Picked material.
   */
  export type MaterialPicker = (
    sender: CubismModel3Json,
    drawable: CubismDrawable
  ) => Promise<Material | null>;

  /**
   * Picks a Material for a CubismDrawable.
   *
   * @param sender Event source.
   * @param drawable Drawable to pick for.
   * @returns Picked texture.
   */
  export type TexturePicker = (
    sender: CubismModel3Json,
    drawable: CubismDrawable
  ) => Promise<Texture2D | null>;
}
//#endregion

/**
 * Exposes moc3.json asset data.
 *
 * **Sealed class.**
 */
class CubismModel3Json {
  /** Makes construction only possible through factories. */
  private constructor() {}

  // #region Load Methods

  /**
   * Loads a model.json asset.
   * @param assetPath The path to the asset.
   * @param loadAssetAtPath Handler for loading assets.
   * @param loadBufferAssetAtPath Handler for loading assets.
   * @returns The CubismModel3Json on success; null otherwise.
   */
  public static async loadAtPath(
    assetPath: string,
    loadAssetAtPath?: CubismModel3Json.LoadAssetAtPathHandler
  ): Promise<CubismModel3Json | null> {
    loadAssetAtPath ??= CubismModel3Json.builtinAssetAtPath;

    // Load Json asset.
    let modelJsonAsset = (await loadAssetAtPath(assetPath, JsonAsset)) as JsonAsset;

    // Return early in case Json asset wasn't loaded.
    if (modelJsonAsset == null || modelJsonAsset.json == null) {
      return null;
    }

    const model3 = CubismModel3Json.loadFromJson(modelJsonAsset.json);
    if (model3 == null) {
      return null;
    }
    model3.assetPath = assetPath;
    model3._loadAssetAtPath = loadAssetAtPath;

    return model3;
  }

  /**
   * **Required properties**
   * Version
   * FileReferences
   *
   * **Optional properties**
   * Groups
   * HitAreas
   * Layout
   * @param json
   * @returns
   */
  public static loadFromJson(json: object) {
    const errorMessage = 'CubismModel3Json.loadFromJson(): json parsing error.';
    const { SerializableFileReferences, SerializableGroup, SerializableHitArea } = CubismModel3Json;

    const version = JsonParseUtils.getNumber(json, 'Version');
    const tempfileReferences = JsonParseUtils.getObject(json, 'FileReferences');
    if (version === undefined || tempfileReferences === undefined) {
      console.error(errorMessage);
      return null;
    }
    const fileReferences =
      SerializableFileReferences.instantiateFromJson(tempfileReferences) ?? undefined;
    if (fileReferences === undefined) {
      console.error(errorMessage);
      return null;
    }

    const tempGroups = JsonParseUtils.getArray(json, 'Groups');
    const tempHitAreas = JsonParseUtils.getArray(json, 'HitAreas');

    const model3Json = new CubismModel3Json();
    model3Json.version = version;
    model3Json.fileReferences = fileReferences;

    function purse<T>(inData: any[] | undefined, func: (json: object) => T | null) {
      return inData !== undefined
        ? JsonParseUtils.arrayedInstantiateFromJson(inData, func) ?? new Array(0)
        : new Array(0);
    }
    model3Json.groups = purse(tempGroups, SerializableGroup.instantiateFromJson);
    model3Json.hitAreas = purse(tempHitAreas, SerializableHitArea.instantiateFromJson);

    return model3Json;
  }

  // #endregion

  private _assetPath: string | null = null;

  /** Path to this. */
  public get assetPath() {
    return this._assetPath;
  }
  private set assetPath(value) {
    this._assetPath = value;
  }
  private _loadAssetAtPath: CubismModel3Json.LoadAssetAtPathHandler | null = null;

  /** Method for loading assets. */
  public async loadAssetAtPath<T extends Asset>(
    assetPath: string,
    constructor: new (...args: any[]) => T
  ): Promise<T | null> {
    if (this._loadAssetAtPath == null) {
      return Promise.reject(null);
    }
    return this._loadAssetAtPath(assetPath, constructor) as Promise<T | null>;
  }
  private setLoadAssetAtPath(value: CubismModel3Json.LoadAssetAtPathHandler | null) {
    this._loadAssetAtPath = value;
  }

  // #region Json Data

  /** The motion3.json format version. */
  @property({ type: CCInteger, serializable: true, visible: true })
  public version: number = 0;

  /** The file references. */
  @property({ serializable: true })
  public fileReferences: CubismModel3Json.SerializableFileReferences =
    new CubismModel3Json.SerializableFileReferences();

  /** Groups. */
  @property({ serializable: true })
  public groups: CubismModel3Json.SerializableGroup[] = new Array(0);

  /** Hit areas. */
  @property({ serializable: true })
  public hitAreas: CubismModel3Json.SerializableHitArea[] = new Array(0);

  // #endregion

  /**
   * The contents of the referenced moc3 asset.
   *
   * The contents isn't cached internally.
   */
  public async getMoc3(): Promise<ArrayBuffer | null> {
    return this.fileReferences.moc != null
      ? await this.loadArrayBuffer(this.fileReferences.moc)
      : null;
  }

  /** CubismPose3Json backing field. */
  @property({ serializable: false })
  private _pose3Json: CubismPose3Json | null = null;

  /** The contents of pose3.json asset. */
  public async getPose3Json(): Promise<CubismPose3Json | null> {
    if (this._pose3Json != null) {
      return this._pose3Json;
    }

    const json =
      this.fileReferences.pose.length == 0 ? null : await this.loadJson(this.fileReferences.pose);
    this._pose3Json = json != null ? CubismPose3Json.loadFromJson(json) : null;
    return this._pose3Json;
  }

  /** Expression3Jsons backing field. */
  @property({ serializable: false })
  private _expression3Jsons: (CubismExp3Json | null)[] | null = null;

  /**
   * The referenced expression assets.
   *
   * The references aren't cached internally.
   */
  public async getExpression3Jsons(): Promise<(CubismExp3Json | null)[] | null> {
    // Load expression only if necessary.
    if (this._expression3Jsons == null) {
      this._expression3Jsons = new Array<CubismExp3Json>(this.fileReferences.expressions.length);

      for (let i = 0; i < this._expression3Jsons.length; i++) {
        let expressionJson =
          this.fileReferences.expressions[i].file.length == 0
            ? null
            : await this.loadJson(this.fileReferences.expressions[i].file);
        this._expression3Jsons[i] =
          expressionJson != null ? CubismExp3Json.loadFromJson(expressionJson) : null;
      }
    }
    return this._expression3Jsons;
  }

  /** The contents of physics3.json asset. */
  public async getPhysics3Json(): Promise<object | null> {
    return isNullOrEmpty(this.fileReferences.physics)
      ? null
      : await this.loadJson(this.fileReferences.physics);
  }

  public async getUserData3Json(): Promise<object | null> {
    return isNullOrEmpty(this.fileReferences.userData)
      ? null
      : await this.loadJson(this.fileReferences.userData);
  }

  /** The contents of cdi3.json asset. */
  public async getDisplayInfo3Json(): Promise<object | null> {
    return isNullOrEmpty(this.fileReferences.displayInfo)
      ? null
      : await this.loadJson(this.fileReferences.displayInfo);
  }

  /** Textures backing field. */
  @property({ serializable: false })
  private _textures: (Texture2D | null)[] | null = null;

  /**
   * The referenced texture assets.
   *
   * The references aren't cached internally.
   */
  public async getTexture(index: number): Promise<Texture2D | null> {
    // Load textures only if necessary.
    if (this._textures == null) {
      this._textures = new Array<Texture2D | null>(this.fileReferences.textures.length);
      for (let i = 0; i < this._textures.length; i++) {
        this._textures[i] = null;
      }
    }
    this._textures[index] ??= await this.loadTexture(this.fileReferences.textures[index]);
    return this._textures[index];
  }

  /**
   * Instantiates a model source and a model.
   * @param pickMaterial The material mapper to use.
   * @param pickTexture The texture mapper to use.
   * @param shouldImportAsOriginalWorkflow Should import as original workflow.
   * @returns The instantiated model on success; null otherwise.
   */
  public async toModel(
    args: {
      pickMaterial?: CubismModel3Json.MaterialPicker;
      pickTexture?: CubismModel3Json.TexturePicker;
      shouldImportAsOriginalWorkflow?: boolean;
    } = {}
  ): Promise<CubismModel | null> {
    const shouldImportAsOriginalWorkflow = args.shouldImportAsOriginalWorkflow ?? false;
    const pickMaterial = args.pickMaterial ?? CubismBuiltinPickers.materialPicker;
    const pickTexture = args.pickTexture ?? CubismBuiltinPickers.texturePicker;

    // Initialize model source and instantiate it.
    const mocAsBytes = await this.getMoc3();
    if (mocAsBytes == null) {
      return null;
    }

    const moc = CubismMoc.createFrom(mocAsBytes);

    //Load from cdi3.json
    const displayInfo3Json = await this.getDisplayInfo3Json();

    // Initialize physics if JSON exists.
    const physics3Json = await this.getPhysics3Json();

    const userData3Json = await this.getUserData3Json();

    return CubismModelNodeGenerator.generateModel({
      model3Json: this,
      moc: moc,
      materialPicker: pickMaterial,
      texturePicker: pickTexture,
      displayInfo3Json: displayInfo3Json,
      physics3Json: physics3Json,
      userData3Json: userData3Json,
      shouldImportAsOriginalWorkflow: shouldImportAsOriginalWorkflow,
    });
  }

  // #region Helper Methods

  /**
   * Type-safely loads an asset.
   *
   * @param referencedFile Path to asset.
   * @returns The asset on success; null otherwise.
   */
  private async loadJson(referencedFile: string): Promise<object | null> {
    if (this.assetPath != null) {
      const assetPath = path.dirname(this.assetPath) + '/' + referencedFile;
      const asset = (await this.loadAssetAtPath(assetPath, JsonAsset)) as JsonAsset | null;
      return asset?.json ?? null;
    }
    return null;
  }

  /**
   * Type-safely loads an asset.
   *
   * @param referencedFile Path to asset.
   * @returns The asset on success; null otherwise.
   */
  private async loadArrayBuffer(referencedFile: string): Promise<ArrayBuffer | null> {
    if (this.assetPath != null) {
      const assetPath = path.dirname(this.assetPath) + '/' + referencedFile;
      return (await this.loadAssetAtPath<BufferAsset>(assetPath, BufferAsset))?.buffer() ?? null;
    }
    return null;
  }

  /**
   * Type-safely loads an asset.
   *
   * @param referencedFile Path to asset.
   * @returns The asset on success; null otherwise.
   */
  private async loadTexture(referencedFile: string): Promise<Texture2D | null> {
    if (this.assetPath != null) {
      const assetPath = path.dirname(this.assetPath) + '/' + referencedFile;
      return this.loadAssetAtPath(assetPath, Texture2D);
    }
    return null;
  }

  /**
   * Builtin method for loading assets.
   * @param assetPath Path to asset.
   * @returns The asset on success; null otherwise.
   */
  private static builtinAssetAtPath<T extends Asset = Asset>(
    assetPath: string,
    constructor: new (...args: any[]) => T
  ): Promise<T | null> {
    const ext = path.extname(assetPath);
    assetPath = assetPath.substring(0, assetPath.length - ext.length);
    if (constructor == (Texture2D as unknown)) {
      assetPath = path.join(assetPath, 'texture');
    }
    // Explicitly deal with byte arrays.
    const promise = new Promise<T | null>((resolve, reject) => {
      resources.load<T>(assetPath, constructor, (error, asset) => {
        if (error != null) {
          reject(null);
        } else {
          resolve(asset);
        }
      });
    });
    return promise;
  }

  /**
   * Checks whether the parameter is an eye blink parameter.
   *
   * (forUnity private method)
   * @param parameter Parameter to check.
   * @param groupName Name of group to query for.
   * @returns true if parameter is an eye blink parameter; false otherwise.
   */
  public isParameterInGroup(parameter: CubismParameter, groupName: string): boolean {
    // Return early if groups aren't available...
    if (this.groups == null || this.groups.length == 0) {
      return false;
    }

    for (let i = 0; i < this.groups.length; i++) {
      const group = this.groups[i];
      if (group.name != groupName) {
        continue;
      }

      if (group.ids != null) {
        const ids = group.ids;
        for (let j = 0; j < ids.length; j++) {
          if (ids[j] == parameter.node.name) {
            return true;
          }
        }
      }
    }

    return false;
  }

  /**
   * Get body index from body array by Id.
   *
   * (forUnity private method)
   * @param bodies Target body array.
   * @param id Id for find.
   * @returns Array index if Id found; -1 otherwise.
   */
  public getBodyIndexById(bodies: readonly CubismUserDataBody[], id: string): number {
    for (let i = 0; i < bodies.length; i++) {
      if (bodies[i].id == id) {
        return i;
      }
    }
    return -1;
  }

  // #endregion
}

// #region Json Helpers

namespace CubismModel3Json {
  /** File references data. (struct) */
  export class SerializableFileReferences implements IStructLike<SerializableFileReferences> {
    /** Relative path to the moc3 asset. */
    public readonly moc: string;
    /** Relative paths to texture assets. */
    public readonly textures: string[];
    /** Relative path to the pose3.json. */
    public readonly pose: string;
    /** Relative path to the expression asset. */
    public readonly expressions: SerializableExpression[];
    /** Relative path to the pose motion3.json. */
    public readonly motions: SerializableMotions;
    /** Relative path to the physics asset. */
    public readonly physics: string;
    /** Relative path to the user data asset. */
    public readonly userData: string;
    /** Relative path to the cdi3.json. */
    public readonly displayInfo: string;

    public constructor(
      args: {
        moc?: string;
        textures?: string[];
        pose?: string;
        expressions?: SerializableExpression[];
        motions?: SerializableMotions;
        physics?: string;
        userData?: string;
        displayInfo?: string;
      } = {}
    ) {
      this.moc = args.moc ?? '';
      this.textures = args.textures ?? new Array();
      this.pose = args.pose ?? '';
      this.expressions = args.expressions ?? new Array();
      this.motions = args.motions ?? SerializableMotions.DEFAULT;
      this.physics = args.physics ?? '';
      this.userData = args.userData ?? '';
      this.displayInfo = args.displayInfo ?? '';
    }

    public copyWith(
      args: {
        moc?: string;
        textures?: string[];
        pose?: string;
        expressions?: SerializableExpression[];
        motions?: SerializableMotions;
        physics?: string;
        userData?: string;
        displayInfo?: string;
      } = {}
    ): SerializableFileReferences {
      return new SerializableFileReferences({
        moc: args.moc ?? this.moc,
        textures: args.textures ?? this.textures,
        pose: args.pose ?? this.pose,
        expressions: args.expressions ?? this.expressions,
        motions: args.motions ?? this.motions,
        physics: args.physics ?? this.physics,
        userData: args.userData ?? this.userData,
        displayInfo: args.displayInfo ?? this.displayInfo,
      });
    }

    public equals(other: SerializableFileReferences): boolean {
      return this === other
        ? true
        : this.moc == other.moc &&
            ArrayExtensions.isEquals((x, y) => x == y, this.textures, other.textures) &&
            this.pose == other.pose &&
            ArrayExtensions.isEquals(
              SerializableExpression.isEquals,
              this.expressions,
              other.expressions
            ) &&
            this.motions == other.motions &&
            this.physics == other.physics &&
            this.userData == other.userData &&
            this.displayInfo == other.displayInfo;
    }

    public strictEquals(other: SerializableFileReferences): boolean {
      return this === other;
    }

    /**
     * **Required properties**
     * - Moc
     * - Textures
     *
     * **Optional properties**
     * - Pose
     * - Expressions
     * - Motions
     * - Physics
     * - UserData
     * - DisplayInfo
     * @param json
     * @returns
     */
    public static instantiateFromJson(json: object): SerializableFileReferences | null {
      const moc = JsonParseUtils.getString(json, 'Moc');
      const textures = JsonParseUtils.getArray(json, 'Textures');
      if (moc === undefined || textures === undefined) {
        console.error('SerializableFileReferences.instantiateFromJson(): json parsing error.');
        return null;
      }
      if (!textures.every((value: any, i: number, arr: any[]) => JsonParseUtils.isString(value))) {
        console.error('SerializableFileReferences.instantiateFromJson(): json parsing error.');
        return null;
      }

      const pose = JsonParseUtils.getString(json, 'Pose');
      const tempExp = JsonParseUtils.getArray(json, 'Expressions');
      const expressions =
        tempExp !== undefined
          ? SerializableExpressions.instantiateFromJson(tempExp) ?? undefined
          : undefined;
      const tempMotions = JsonParseUtils.getObject(json, 'Motions');
      const motions =
        tempMotions !== undefined
          ? SerializableMotions.instantiateFromJson(tempMotions) ?? undefined
          : undefined;
      const physics = JsonParseUtils.getString(json, 'Physics');
      const userData = JsonParseUtils.getString(json, 'UserData');
      const displayInfo = JsonParseUtils.getString(json, 'DisplayInfo');
      return new SerializableFileReferences({
        moc: moc,
        textures: textures,
        pose: pose,
        expressions: expressions,
        motions: motions,
        physics: physics,
        userData: userData,
        displayInfo: displayInfo,
      });
    }
  }

  /** Group data. (struct) */
  export class SerializableGroup implements IStructLike<SerializableGroup> {
    /** Target type. */
    public readonly target: string;
    /** Group name. */
    public readonly name: string;
    /** Referenced IDs. */
    public readonly ids: string[];

    public constructor(
      args: {
        target?: string;
        name?: string;
        ids?: string[];
      } = {}
    ) {
      this.target = args.target ?? '';
      this.name = args.name ?? '';
      this.ids = args.ids ?? new Array(0);
    }

    public copyWith(
      args: {
        target?: string;
        name?: string;
        ids?: string[];
      } = {}
    ): SerializableGroup {
      return new SerializableGroup({
        target: args.target ?? this.target,
        name: args.name ?? this.name,
        ids: args.ids ?? this.ids,
      });
    }

    public equals(other: SerializableGroup): boolean {
      return this === other
        ? true
        : this.target == other.target && this.name == other.name && this.ids == other.ids;
    }

    public strictEquals(other: SerializableGroup): boolean {
      return this === other;
    }

    /**
     * **Required properties**
     * - Target
     * - Name
     * - Ids
     * @param json
     * @returns
     */
    public static instantiateFromJson(json: object): SerializableGroup | null {
      const target = JsonParseUtils.getString(json, 'Target');
      const name = JsonParseUtils.getString(json, 'Name');
      const ids = JsonParseUtils.getArray(json, 'Ids');
      if (target === undefined || name === undefined || ids === undefined) {
        console.error(
          'SerializableGroup.instantiateFromJson(): json parsing error. (Target: %s, Name: %s, Ids: %s)',
          target,
          name,
          ids
        );
        return null;
      }
      if (!ids.every((value: any, index: number, array: any[]) => JsonParseUtils.isString(value))) {
        console.error('SerializableGroup.instantiateFromJson(): json parsing error.');
        return null;
      }
      return new SerializableGroup({
        target: target,
        name: name,
        ids: ids,
      });
    }
  }

  /** Expression data. (struct) */
  export class SerializableExpression implements IStructLike<SerializableExpression> {
    /** Expression Name. */
    public readonly name: string;
    /** Expression File. */
    public readonly file: string;
    /** Expression FadeInTime. */
    public readonly fadeInTime: number;
    /** Expression FadeOutTime. */
    public readonly fadeOutTime: number;

    public constructor(
      args: {
        name?: string;
        file?: string;
        fadeInTime?: number;
        fadeOutTime?: number;
      } = {}
    ) {
      this.name = args.name ?? '';
      this.file = args.file ?? '';
      this.fadeInTime = args.fadeInTime ?? 0;
      this.fadeOutTime = args.fadeOutTime ?? 0;
    }

    public copyWith(
      args: {
        name?: string;
        file?: string;
        fadeInTime?: number;
        fadeOutTime?: number;
      } = {}
    ): SerializableExpression {
      return new SerializableExpression({
        name: args.name ?? this.name,
        file: args.file ?? this.file,
        fadeInTime: args.fadeInTime ?? this.fadeInTime,
        fadeOutTime: args.fadeOutTime ?? this.fadeOutTime,
      });
    }

    public equals(other: SerializableExpression): boolean {
      return this === other
        ? true
        : this.name == other.name &&
            this.file == other.file &&
            this.fadeInTime == this.fadeOutTime &&
            this.fadeOutTime == other.fadeOutTime;
    }

    public strictEquals(other: SerializableExpression): boolean {
      return this === other;
    }

    public static isEquals(a: SerializableExpression, b: SerializableExpression) {
      return a.equals(b);
    }

    /**
     * **Required properties**
     * - Name
     * - File
     *
     * **Optional properties**
     * - FadeInTime
     * - FadeOutTime
     * @param json
     * @returns
     */
    public static instantiateFromJson(json: object): SerializableExpression | null {
      const name = JsonParseUtils.getString(json, 'Name');
      const file = JsonParseUtils.getString(json, 'File');
      if (name === undefined || file === undefined) {
        console.error(
          'SerializableExpression.instantiateFromJson(): json parsing error. (Name: %s, File: %s)',
          name,
          file
        );
        return null;
      }
      const fadeInTime = JsonParseUtils.getNumber(json, 'FadeInTime');
      const fadeOutTime = JsonParseUtils.getNumber(json, 'FadeOutTime');
      return new SerializableExpression({
        name: name,
        file: file,
        fadeInTime: fadeInTime,
        fadeOutTime: fadeOutTime,
      });
    }
  }

  export namespace SerializableExpressions {
    /**
     *
     * @param json
     * @returns
     */
    export function instantiateFromJson(json: any[]): SerializableExpression[] | null {
      const errorMessage = 'SerializableExpressions.instantiateFromJson(): json parsing error.';
      const expressions = new Array<SerializableExpression>(json.length);
      for (let i = 0; i < json.length; i++) {
        if (!JsonParseUtils.isObject(json[i])) {
          console.error(errorMessage);
          return null;
        }
        const instance = SerializableExpression.instantiateFromJson(json[i]);
        if (instance == null) {
          console.error(errorMessage);
          return null;
        }
        expressions[i] = instance;
      }
      return expressions;
    }
  }

  /** Motion data. (struct) */
  export class SerializableMotions implements IStructLike<SerializableMotions> {
    public readonly motions = new Map<string, SerializableMotion[]>();
    /** Motion group names. */
    public readonly groupNames: string[];

    public get(key: string): SerializableMotion[] | null {
      return this.motions.get(key) ?? null;
    }

    public constructor(
      args: {
        motions?: Map<string, SerializableMotion[]>;
      } = {}
    ) {
      if (args.motions != null) {
        if (!Object.isFrozen(args.motions)) {
          this.motions = new Map<string, SerializableMotion[]>();
          this.groupNames = new Array<string>(args.motions.size);
          let i = 0;
          for (const entry of args.motions.entries()) {
            this.motions.set(entry[0], entry[1]);
            this.groupNames[i++] = entry[0];
          }
          return;
        } else {
          this.motions = args.motions;
          this.groupNames = new Array<string>(args.motions.size);
          let i = 0;
          for (const key of args.motions.keys()) {
            this.groupNames[i++] = key;
          }
        }
      } else {
        this.motions = new Map();
        this.groupNames = new Array(0);
      }
    }

    public copyWith(
      args: {
        motions?: Map<string, SerializableMotion[]>;
      } = {}
    ): SerializableMotions {
      return new SerializableMotions({
        motions: args.motions ?? this.motions,
      });
    }

    public equals(other: SerializableMotions): boolean {
      if (this === other) {
        return true;
      }
      if (this.motions === other.motions) {
        return true;
      }
      if (this.motions.size != other.motions.size) {
        return false;
      }
      for (const key of this.motions.keys()) {
        if (this.motions.get(key) != other.motions.get(key)) {
          return false;
        }
      }
      return true;
    }

    public strictEquals(other: SerializableMotions): boolean {
      return this === other;
    }

    /**
     *
     * @param json
     * @returns
     */
    public static instantiateFromJson(json: object): SerializableMotions | null {
      const errorMessage = 'SerializableMotions.instantiateFromJson(): json parsing error.';
      const groupNames = Object.keys(json);
      const map = new Map<string, SerializableMotion[]>();
      for (let i = 0; i < groupNames.length; i++) {
        const item = JsonParseUtils.getArray(json, groupNames[i]);
        if (item === undefined) {
          console.error(errorMessage);
          return null;
        }

        const motion = new Array<SerializableMotion>(item.length);
        for (let j = 0; j < motion.length; j++) {
          if (item[j] == null) {
            console.error(errorMessage);
            return null;
          }
          const input = SerializableMotion.instantiateFromJson(item[j]);
          if (input == null) {
            console.error(errorMessage);
            return null;
          }
          motion[j] = input;
        }

        map.set(groupNames[i], motion);
      }
      return new SerializableMotions({ motions: map });
    }
  }

  /** Motion data. (struct) */
  export class SerializableMotion implements IStructLike<SerializableMotion> {
    /** File path. */
    public readonly file: string;
    /** Sound path. */
    public readonly sound: string;
    /** Fade in time. */
    public readonly fadeInTime: number;
    /** Fade out time. */
    public readonly fadeOutTime: number;

    public constructor(
      args: {
        file?: string;
        sound?: string;
        fadeInTime?: number;
        fadeOutTime?: number;
      } = {}
    ) {
      this.file = args.file ?? '';
      this.sound = args.sound ?? '';
      this.fadeInTime = args.fadeInTime ?? 0;
      this.fadeOutTime = args.fadeOutTime ?? 0;
    }

    public copyWith(
      args: {
        file?: string;
        sound?: string;
        fadeInTime?: number;
        fadeOutTime?: number;
      } = {}
    ): SerializableMotion {
      return new SerializableMotion({
        file: args.file ?? this.file,
        sound: args.sound ?? this.sound,
        fadeInTime: args.fadeInTime ?? this.fadeInTime,
        fadeOutTime: args.fadeOutTime ?? this.fadeOutTime,
      });
    }

    public equals(other: SerializableMotion): boolean {
      return this === other
        ? true
        : this.file == other.file &&
            this.sound == other.sound &&
            this.fadeInTime == other.fadeInTime &&
            this.fadeOutTime == other.fadeOutTime;
    }

    public strictEquals(other: SerializableMotion): boolean {
      return this === other;
    }

    /**
     * **Required properties**
     * - File
     *
     * **Optional properties**
     * - FadeOutTime
     * - FadeInTime
     * - Sound
     * @param json
     * @returns
     */
    public static instantiateFromJson(json: object): SerializableMotion | null {
      const errorMessage = 'SerializableMotion.instantiateFromJson(): json parsing error.';
      const file = JsonParseUtils.getString(json, 'File');
      if (file === undefined) {
        console.error(errorMessage);
        return null;
      }
      const sound = JsonParseUtils.getString(json, 'Sound');
      const fadeInTime = JsonParseUtils.getNumber(json, 'FadeInTime');
      const fadeOutTime = JsonParseUtils.getNumber(json, 'FadeOutTime');
      return new SerializableMotion({
        file: file,
        sound: sound,
        fadeInTime: fadeInTime,
        fadeOutTime: fadeOutTime,
      });
    }
  }

  /** Hit Area. (struct) */
  export class SerializableHitArea implements IStructLike<SerializableHitArea> {
    /** Hit area name. */
    public readonly name: string;
    /** Hit area id. */
    public readonly id: string;

    public constructor(
      args: {
        name?: string;
        id?: string;
      } = {}
    ) {
      this.name = args.name ?? '';
      this.id = args.id ?? '';
    }

    public copyWith(
      args: {
        name?: string;
        id?: string;
      } = {}
    ): SerializableHitArea {
      return new SerializableHitArea({
        name: args.name ? args.name : this.name,
        id: args.id ? args.id : this.id,
      });
    }

    public equals(other: SerializableHitArea): boolean {
      return this === other ? true : this.name == other.name && this.id == other.id;
    }

    public strictEquals(other: SerializableHitArea): boolean {
      return this === other;
    }

    /**
     * **Required properties**
     * - Name
     * - Id
     * @param json
     * @returns
     */
    public static instantiateFromJson(json: object): SerializableHitArea | null {
      const errorMessage = 'SerializableHitArea.instantiateFromJson(): json parsing error.';
      const name = JsonParseUtils.getString(json, 'Name');
      if (name === undefined) {
        console.error(errorMessage);
        return null;
      }
      const id = JsonParseUtils.getString(json, 'Id');
      if (id === undefined) {
        console.error(errorMessage);
        return null;
      }
      return new SerializableHitArea({
        name: name,
        id: id,
      });
    }
  }

  export namespace SerializableGroup {
    export const DEFAULT = new SerializableGroup();
  }
  export namespace SerializableExpression {
    export const DEFAULT = new SerializableExpression();
  }
  export namespace SerializableMotions {
    export const DEFAULT = new SerializableMotions();
  }
  export namespace SerializableMotion {
    export const DEFAULT = new SerializableMotion();
  }
  export namespace SerializableHitArea {
    export const DEFAULT = new SerializableHitArea();
  }
}
// #endregion

export default CubismModel3Json;

export namespace CubismModelNodeGenerator {
  export async function generateModel(args: {
    model3Json: CubismModel3Json;
    moc: CubismMoc;
    materialPicker: CubismModel3Json.MaterialPicker;
    texturePicker: CubismModel3Json.TexturePicker;
    displayInfo3Json?: object | null;
    physics3Json?: object | null;
    userData3Json?: object | null;
    pose3Json?: object | null;
    expList?: CubismExpressionList | null;
    shouldImportAsOriginalWorkflow?: boolean;
  }): Promise<CubismModel | null> {
    const shouldImportAsOriginalWorkflow = args.shouldImportAsOriginalWorkflow ?? false;

    const model3 = args.model3Json;

    const model = CubismModel.instantiateFrom(args.moc);
    if (model == null) {
      console.error(
        'CubismModelNodeGenerator.generateModel(): CubismModel.instantiateFrom() failed.'
      );
      return null;
    }

    model.name = path.basename(model3.fileReferences.moc);

    // Add parameters and parts inspectors.
    if (EDITOR) {
      model.addComponent(CubismParametersInspector);
      model.addComponent(CubismPartsInspector);
    }

    // Create renderers.
    const rendererController = Internal.setupCubismRenderController(model);
    console.assert(rendererController);
    console.assert(rendererController!.renderers);
    const renderers = rendererController!.renderers!;
    console.assert(model.drawables);
    const drawables = model.drawables!;

    await Internal.setupMaterialsAndTextures(
      model3,
      drawables,
      renderers,
      args.materialPicker,
      args.texturePicker
    );

    // Initialize drawables.
    if (model3.hitAreas != null) {
      Internal.setupHitAreas(drawables, model3);
    }

    // Load from cdi3.json
    Internal.setupFromDisplayInfo3Json(args.displayInfo3Json ?? null, model, model3);

    // Add mask controller if required.
    Internal.setupMaskController(model, drawables);

    // Add original workflow component if is original workflow.
    if (shouldImportAsOriginalWorkflow) {
      Internal.setupOriginalWorkflow(model, args.expList);
    }

    // Initialize physics if JSON exists.
    if (args.physics3Json != null) {
      Internal.setupPhysicsController(args.physics3Json, model);
    }

    if (args.pose3Json != null) {
      Internal.setupCubismPosePart(args.pose3Json, model);
    }

    if (args.userData3Json != null) {
      Internal.setupUserDataTag(args.userData3Json, model3, drawables);
    }

    Internal.setupAnimationController(model);
    Internal.finalize(model);
    return model;
  }
}

namespace Internal {
  export function setupCubismRenderController(
    model: Readonly<CubismModel>
  ): CubismRenderController | null {
    const rendererController = model.addComponent(CubismRenderController);
    console.assert(rendererController);
    // シーン上に存在しないため初期化処理が入らないので無理やり呼び出す。
    if (Reflect.has(rendererController!, 'onEnable')) {
      const func = Reflect.get(rendererController!, 'onEnable') as Function;
      const onEnable = typeof func == 'function' ? (func as Function) : undefined;
      if (onEnable) {
        onEnable.call(rendererController);
      } else {
        console.error(
          'Internal.setupCubismRenderController(): rendererController.onEnable is not function property.'
        );
        return null;
      }
    } else {
      console.error(
        'Internal.setupCubismRenderController(): rendererController.onEnable is undefined.'
      );
      return null;
    }
    return rendererController;
  }
  export async function setupMaterialsAndTextures(
    sender: Readonly<CubismModel3Json>,
    drawables: readonly CubismDrawable[],
    renderers: readonly CubismRenderer[],
    pickMaterial: CubismModel3Json.MaterialPicker,
    pickTexture: CubismModel3Json.TexturePicker
  ) {
    // Initialize materials.
    for (let i = 0; i < renderers.length; i++) {
      renderers[i].material = await pickMaterial(sender as CubismModel3Json, drawables[i]);
    }

    // Initialize textures.
    for (let i = 0; i < renderers.length; i++) {
      renderers[i].mainTexture = await pickTexture(sender as CubismModel3Json, drawables[i]);
    }
  }
  export function setupHitAreas(
    drawables: readonly CubismDrawable[],
    model3: Readonly<CubismModel3Json>
  ) {
    for (let i = 0; i < model3.hitAreas.length; i++) {
      for (let j = 0; j < drawables.length; j++) {
        if (drawables[j].id == model3.hitAreas[i].id) {
          const hitArea = model3.hitAreas[i];

          // Add components for hit judgement to HitArea target Drawables.
          const hitDrawable = drawables[j].addComponent(CubismHitDrawable);
          console.assert(hitDrawable != null);
          hitDrawable!.name = hitArea.name;
          const raycastable = drawables[j].addComponent(CubismRaycastable);
          console.assert(raycastable != null);
          break;
        }
      }
    }
  }

  export function setupFromDisplayInfo3Json(
    json: object | null,
    model: Readonly<CubismModel>,
    model3: Readonly<CubismModel3Json>
  ) {
    const cdi3Json = CubismDisplayInfo3Json.loadFromJson(json);

    // Initialize groups.
    console.assert(model.parameters);
    const parameters = model.parameters!;

    for (let i = 0; i < parameters.length; i++) {
      if (model3.isParameterInGroup(parameters[i], 'EyeBlink')) {
        const eyeBlinkController =
          model.getComponent(CubismEyeBlinkController) ??
          model.addComponent(CubismEyeBlinkController);
        console.assert(eyeBlinkController);
        const eyeBlinkParameter = parameters[i].addComponent(CubismEyeBlinkParameter);
        console.assert(eyeBlinkParameter);
      }

      // Set up mouth parameters.
      if (model3.isParameterInGroup(parameters[i], 'LipSync')) {
        const mouthController =
          model.getComponent(CubismMouthController) ?? model.addComponent(CubismMouthController);
        console.assert(mouthController);
        const mouthParameter = parameters[i].addComponent(CubismMouthParameter);
        console.assert(mouthParameter);
      }

      // Setting up the parameter name for display.
      if (cdi3Json != null) {
        const cubismDisplayInfoParameterName = parameters[i].addComponent(
          CubismDisplayInfoParameterName
        );
        console.assert(cubismDisplayInfoParameterName);
        cubismDisplayInfoParameterName!.parameterName = cdi3Json.parameters[i].name;
        cubismDisplayInfoParameterName!.displayName = '';
      }
    }

    // Setting up the part name for display.
    if (cdi3Json != null) {
      // Initialize groups.
      console.assert(model.parts);
      const parts = model.parts!;
      for (let i = 0; i < parts.length; i++) {
        const cubismDisplayInfoPartNames = parts[i].addComponent(CubismDisplayInfoPartName);
        console.assert(cubismDisplayInfoPartNames);
        cubismDisplayInfoPartNames!.partName = cdi3Json.parts[i].name;
        cubismDisplayInfoPartNames!.displayName = '';
      }
    }
  }
  export function setupMaskController(
    model: Readonly<CubismModel>,
    drawables: readonly CubismDrawable[]
  ) {
    if (drawables.some((value, index, array) => value.isMasked)) {
      const maskController = model.addComponent(CubismMaskController);
      console.assert(maskController);
    }
  }
  export function setupOriginalWorkflow(
    model: Readonly<CubismModel>,
    expList?: CubismExpressionList | null
  ) {
    // Add cubism update manager.
    const updateController =
      model.getComponent(CubismUpdateController) ?? model.addComponent(CubismUpdateController);
    console.assert(updateController);

    // Add parameter store.
    const parameterStore =
      model.getComponent(CubismParameterStore) ?? model.addComponent(CubismParameterStore);
    console.assert(parameterStore);

    // Add pose controller.
    const poseController =
      model.getComponent(CubismPoseController) ?? model.addComponent(CubismPoseController);
    console.assert(poseController);

    // Add expression controller.
    const expressionController =
      model.getComponent(CubismExpressionController) ??
      model.addComponent(CubismExpressionController);
    console.assert(expressionController);
    if (expList) {
      expressionController!.expressionsList = expList;
    }

    // Add fade controller.
    const motionFadeController =
      model.getComponent(CubismFadeController) ?? model.addComponent(CubismFadeController);
    console.assert(motionFadeController);
  }
  export function setupPhysicsController(json: object, model: Readonly<CubismModel>) {
    const physics3Json = CubismPhysics3Json.loadFromJson(json);
    if (physics3Json == null) {
      return;
    }
    const physicsController =
      model.getComponent(CubismPhysicsController) ?? model.addComponent(CubismPhysicsController);
    console.assert(physicsController);
    physicsController!.initialize(physics3Json.toRig());
  }
  export function setupUserDataTag(
    json: object,
    model3: Readonly<CubismModel3Json>,
    drawables: readonly CubismDrawable[]
  ) {
    const userData3Json = CubismUserData3Json.loadFromJson(json);
    if (userData3Json == null) {
      return;
    }
    const drawableBodies = userData3Json.toBodyArray(CubismUserDataTargetType.ArtMesh);
    for (let i = 0; i < drawables.length; i++) {
      const index = model3.getBodyIndexById(drawableBodies, drawables[i].id);
      if (index >= 0) {
        const tag =
          drawables[i].getComponent(CubismUserDataTag) ??
          drawables[i].addComponent(CubismUserDataTag);
        console.assert(tag);
        tag!.initialize(drawableBodies[index]);
      }
    }
  }
  export function setupCubismPosePart(json: object, model: Readonly<CubismModel>) {
    const pose3Json = CubismPose3Json.loadFromJson(json);
    if (pose3Json == null) {
      return;
    }

    const { parts } = model;
    const { groups } = pose3Json;

    // Fail silently...
    if (parts == null || groups == null) {
      return;
    }

    for (let groupIndex = 0; groupIndex < groups.length; groupIndex++) {
      const group = groups[groupIndex];

      // Fail silently...
      if (group == null) {
        continue;
      }

      for (let partIndex = 0; partIndex < group.length; partIndex++) {
        const part = ArrayExtensionMethods.findByIdFromParts(parts, group[partIndex].id);
        if (part == null) {
          continue;
        }
        const posePart =
          part.getComponent(CubismPosePart) ??
          (part.addComponent(CubismPosePart) as CubismPosePart);
        console.assert(posePart);
        posePart.groupIndex = groupIndex;
        posePart.partIndex = partIndex;
        posePart.link = group[partIndex].link;
      }
    }
  }
  export function setupAnimationController(model: Readonly<CubismModel>) {
    const animationController =
      model.getComponent(animation.AnimationController) ??
      model.addComponent(animation.AnimationController);
    console.assert(animationController);
  }
  export function finalize(model: Readonly<CubismModel>) {
    // Make sure model is 'fresh'
    model.forceUpdateNow();
  }
}
