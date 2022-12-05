/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

export default class CubismFadeMotionDataAsset {
  public motionName: string;
  public fadeInTime: number;
  public fadeOutTime: number;
  public parameterIds: string[];
  public internalParameterCurves: CubismSerializableCurve[];
  public parameterFadeInTimes: number[];
  public parameterFadeOutTimes: number[];
  public motionLength: number;
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
    this.motionName = motionName ?? '';
    this.fadeInTime = fadeInTime ?? 0;
    this.fadeOutTime = fadeOutTime ?? 0;
    this.parameterIds = parameterIds ?? new Array(0);
    this.internalParameterCurves = internalParameterCurves ?? new Array(0);
    this.parameterFadeInTimes = parameterFadeInTimes ?? new Array(0);
    this.parameterFadeOutTimes = parameterFadeOutTimes ?? new Array(0);
    this.motionLength = motionLength ?? 0;
  }

  public static deserializeFromJson(json: any): CubismFadeMotionDataAsset | undefined {
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
    return new CubismFadeMotionDataAsset(
      motionName,
      fadeInTime,
      fadeOutTime,
      parameterIds,
      internalParameterCurves,
      parameterFadeInTimes,
      parameterFadeOutTimes,
      motionLength
    );
  }
}

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

class CubismSerializableCurve {
  private data: CubismSerializableKeyFrame[];

  public constructor(arrayLength?: number | undefined) {
    this.data = new Array(arrayLength ?? 0);
  }

  public get length() {
    return this.data.length;
  }

  public setKeyFrame(index: number, value: CubismSerializableKeyFrame) {
    this.data[index] = value;
  }

  public getKeyFrame(index: number): CubismSerializableKeyFrame {
    return this.data[index];
  }

  public static instantiateFromJson(src: any): CubismSerializableCurve | undefined {
    if (src == null) {
      return undefined;
    }
    const { data } = src;
    if (!Array.isArray(data)) {
      return undefined;
    }
    const instance = new CubismSerializableCurve(data.length);
    for (let i = 0; i < data.length; i++) {
      const keyFrame = CubismSerializableKeyFrame.instantiateFromJson(data[i]);
      if (!keyFrame) {
        return undefined;
      }
      instance.setKeyFrame(i, keyFrame);
    }
    return instance;
  }
}
class CubismSerializableKeyFrame {
  public time: number;
  public value: number;
  public inTangent: number;
  public inWeight: number;
  public outTangent: number;
  public outWeight: number;
  public weightedMode: number;
  public constructor(
    time?: number,
    value?: number,
    inTangent?: number,
    inWeight?: number,
    outTangent?: number,
    outWeight?: number,
    weightedMode?: number
  ) {
    this.time = time ?? 0;
    this.value = value ?? 0;
    this.inTangent = inTangent ?? 0;
    this.inWeight = inWeight ?? 0;
    this.outTangent = outTangent ?? 0;
    this.outWeight = outWeight ?? 0;
    this.weightedMode = weightedMode ?? 0;
  }
  public static instantiateFromJson(src: any): CubismSerializableKeyFrame | undefined {
    if (src == null) {
      return undefined;
    }
    const time = src.time;
    if (!isNumber(time)) {
      return undefined;
    }
    const value = src.value;
    if (!isNumber(value)) {
      return undefined;
    }
    const inTangent = isNumber(src.inTangent) ? (src.inTangent as number) : undefined;
    const inWeight = isNumber(src.inWeight) ? (src.inWeight as number) : undefined;
    const outTangent = isNumber(src.outTangent) ? (src.outTangent as number) : undefined;
    const outWeight = isNumber(src.outWeight) ? (src.outWeight as number) : undefined;
    const weightedMode = isNumber(src.weightedMode) ? (src.weightedMode as number) : undefined;
    return new CubismSerializableKeyFrame(
      time,
      value,
      inTangent,
      inWeight,
      outTangent,
      outWeight,
      weightedMode
    );
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
