/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

import { Asset, CCString, CCFloat, RealCurve, _decorator, RealKeyframeValue, math } from 'cc';
import CubismMotion3Json from '../Json/CubismMotion3Json';
import CubismSerializableCurve from './CubismSerializableCurve';
import CubismSerializableKeyFrame from './CubismSerializableKeyFrame';
const { ccclass, property } = _decorator;

/** from ScriptableObject */
@ccclass('CubismFadeMotionData')
export default class CubismFadeMotionData extends Asset {
  /** Name of motion. */
  @property(CCString)
  public motionName: string;

  /** Time to fade in. */
  @property(CCFloat)
  public fadeInTime: number;

  /** Time to fade out. */
  @property(CCFloat)
  public fadeOutTime: number;

  /** Parameter ids. */
  @property([CCString])
  public parameterIds: string[];

  /** Parameter curves. */
  public parameterCurves: RealCurve[];

  @property([CubismSerializableCurve])
  private internalParameterCurves: CubismSerializableCurve[];

  /** Fade in time parameters. */
  @property([CCFloat])
  public parameterFadeInTimes: number[];

  /** Fade out time parameters. */
  @property([CCFloat])
  public parameterFadeOutTimes: number[];

  /** Motion length. */
  @property(CCFloat)
  public motionLength: number;

  public onLoaded() {
    this.internalConvertToCurves();
  }

  public constructor(
    motionName?: string,
    fadeInTime?: number,
    fadeOutTime?: number,
    parameterIds?: string[],
    internalParameterCurves?: CubismSerializableCurve[],
    parameterFadeInTimes?: number[],
    parameterFadeOutTimes?: number[],
    motionLength?: number
  ) {
    super();
    this.motionName = motionName ?? '';
    this.fadeInTime = fadeInTime ?? 0;
    this.fadeOutTime = fadeOutTime ?? 0;
    this.parameterIds = parameterIds ?? new Array(0);
    this.internalParameterCurves = internalParameterCurves ?? new Array(0);
    this.parameterCurves = new Array(this.internalParameterCurves.length);
    this.parameterFadeInTimes = parameterFadeInTimes ?? new Array(0);
    this.parameterFadeOutTimes = parameterFadeOutTimes ?? new Array(0);
    this.motionLength = motionLength ?? 0;
    this.internalConvertToCurves();
  }

  private internalConvertToCurves() {
    const { internalParameterCurves: iCurves } = this;
    const oCurves = new Array<RealCurve>(iCurves.length);
    for (let i = 0; i < iCurves.length; i++) {
      const element = iCurves[i];
      oCurves[i] = element.toRealCurve();
    }
    this.parameterCurves = oCurves;
  }

  /**
   * Create CubismFadeMotionData from CubismMotion3Json.
   * @param motion3Json Motion3json as the creator.
   * @param motionName Motion name of interest.
   * @param motionLength Length of target motion.
   * @param shouldImportAsOriginalWorkflow Whether the original work flow or not.
   * @param isCallFromModelJson Whether it is a call from the model json.
   * @returns Fade data created based on motion3json.
   */
  public static createInstance(
    motion3Json: CubismMotion3Json,
    motionName: string,
    motionLength: number,
    shouldImportAsOriginalWorkflow: boolean = false,
    isCallFromModelJson: boolean = false
  ): CubismFadeMotionData {
    const fadeMotion = new CubismFadeMotionData();
    const curveCount = motion3Json.curves.length;
    fadeMotion.parameterIds = new Array<string>(curveCount);
    fadeMotion.parameterFadeInTimes = new Array<number>(curveCount);
    fadeMotion.parameterFadeOutTimes = new Array<number>(curveCount);
    fadeMotion.parameterCurves = new Array<RealCurve>(curveCount);

    return this.toSetInstance(
      fadeMotion,
      motion3Json,
      motionName,
      motionLength,
      shouldImportAsOriginalWorkflow,
      isCallFromModelJson
    );
  }

  /**
   * Put motion3json's fade information back into fade motion data.
   * @param fadeMotion Instance containing fade information.
   * @param motion3Json Target motion3json.
   * @param motionName Motion name of interest.
   * @param motionLength Motion length.
   * @param shouldImportAsOriginalWorkflow Whether the original work flow or not.
   * @param isCallFormModelJson Whether it is a call from the model json.
   * @returns Fade data created based on fademotiondata.
   */
  public static toSetInstance(
    fadeMotion: CubismFadeMotionData,
    motion3Json: CubismMotion3Json,
    motionName: string,
    motionLength: number,
    shouldImportAsOriginalWorkflow: boolean = false,
    isCallFormModelJson: boolean = false
  ): CubismFadeMotionData {
    fadeMotion.motionName = motionName;
    fadeMotion.motionLength = motionLength;
    fadeMotion.fadeInTime = motion3Json.meta.fadeInTime < 0.0 ? 1.0 : motion3Json.meta.fadeInTime;
    fadeMotion.fadeOutTime =
      motion3Json.meta.fadeOutTime < 0.0 ? 1.0 : motion3Json.meta.fadeOutTime;

    const { curves: jsonCurves } = motion3Json;
    const {
      parameterIds,
      parameterFadeInTimes,
      parameterFadeOutTimes,
      parameterCurves,
      internalParameterCurves,
    } = fadeMotion;

    if (parameterIds != null && parameterFadeInTimes != null && parameterFadeOutTimes != null) {
      parameterCurves.length =
        parameterCurves.length < jsonCurves.length ? jsonCurves.length : parameterCurves.length;
      internalParameterCurves.length =
        internalParameterCurves.length < jsonCurves.length
          ? jsonCurves.length
          : internalParameterCurves.length;
      for (let i = 0; i < jsonCurves.length; i++) {
        const curve = jsonCurves[i];

        // In original workflow mode, skip add part opacity curve when call not from model3.json.
        if (
          curve.target == 'PartOpacity' &&
          shouldImportAsOriginalWorkflow &&
          !isCallFormModelJson
        ) {
          continue;
        }

        parameterIds[i] = curve.id;
        parameterFadeInTimes[i] = curve.fadeInTime < 0.0 ? -1.0 : curve.fadeInTime;
        parameterFadeOutTimes[i] = curve.fadeOutTime < 0.0 ? -1.0 : curve.fadeOutTime;
        const keys = CubismMotion3Json.convertCurveSegmentsToKeyframes(curve.segments);
        internalParameterCurves[i] = new CubismSerializableCurve(keys.length);
        for (let j = 0; j < keys.length; j++) {
          const { 0: t, 1: v } = keys[j];
          const keyFrame = new CubismSerializableKeyFrame(
            t,
            v.value,
            v.leftTangent,
            v.leftTangentWeight,
            v.rightTangent,
            v.rightTangentWeight
          );
          internalParameterCurves[i].setKeyFrame(j, keyFrame);
        }
      }
    }
    fadeMotion.onLoaded();
    return fadeMotion;
  }

  public static deserializeFromJson(json: any): CubismFadeMotionData | undefined {
    const motionName = json.motionName;
    if (!isString(motionName)) {
      return undefined;
    }
    const fadeInTime = json.fadeInTime;
    if (!isNumber(fadeInTime)) {
      return undefined;
    }
    const fadeOutTime = json.fadeOutTime;
    if (!isNumber(fadeOutTime)) {
      return undefined;
    }
    const parameterIds = asArray<string>(json.parameterIds, isString);
    if (!parameterIds) {
      return undefined;
    }
    const internalParameterCurves = CubismSerializableCurves.instantiateFromJson(
      json.internalParameterCurves
    );
    if (!internalParameterCurves) {
      return undefined;
    }
    const parameterFadeInTimes = asArray<number>(json.parameterFadeInTimes, isNumber);
    if (!parameterFadeInTimes) {
      return undefined;
    }
    const parameterFadeOutTimes = asArray<number>(json.parameterFadeOutTimes, isNumber);
    if (!parameterFadeOutTimes) {
      return undefined;
    }
    const motionLength = json.motionLength;
    if (!isNumber(motionLength)) {
      return undefined;
    }
    const instance = new CubismFadeMotionData(
      motionName,
      fadeInTime,
      fadeOutTime,
      parameterIds,
      internalParameterCurves,
      parameterFadeInTimes,
      parameterFadeOutTimes,
      motionLength
    );
    return instance;
  }
}

/**
 * Alias  CubismSerializableCurves[]
 */
namespace CubismSerializableCurves {
  export function instantiateFromJson(src: any) {
    if (!Array.isArray(src)) {
      return undefined;
    }
    const curves = new Array<CubismSerializableCurve>(src.length);
    for (let i = 0; i < src.length; i++) {
      const curve = CubismSerializableCurve.instantiateFromJson(src[i]);
      if (curve == null) {
        return undefined;
      }
      curves[i] = curve;
    }
    return curves;
  }
}

function isString(value: any): value is string {
  return typeof value == 'string';
}
function isNumber(value: any): value is number {
  return typeof value == 'number';
}
function asArray<T>(src: any, isTypeFunc: (value: any) => value is T): T[] | undefined {
  if (!Array.isArray(src)) {
    return undefined;
  }
  if (!src.every(isTypeFunc)) {
    return undefined;
  }
  return src as T[];
}
