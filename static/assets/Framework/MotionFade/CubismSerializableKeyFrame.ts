/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

import { CCFloat, Enum, TangentWeightMode, _decorator } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('CubismSerializableKeyFrame')
export default class CubismSerializableKeyFrame {
  @property(CCFloat)
  public time: number;
  @property(CCFloat)
  public value: number;
  @property(CCFloat)
  public inTangent: number;
  @property(CCFloat)
  public inWeight: number;
  @property(CCFloat)
  public outTangent: number;
  @property(CCFloat)
  public outWeight: number;
  @property({ type: Enum(TangentWeightMode) })
  public weightedMode: TangentWeightMode = TangentWeightMode.NONE;
  public constructor(
    time?: number,
    value?: number,
    inTangent?: number,
    inWeight?: number,
    outTangent?: number,
    outWeight?: number,
    weightedMode?: TangentWeightMode
  ) {
    this.time = time ?? 0;
    this.value = value ?? 0;
    this.inTangent = inTangent ?? 0;
    this.inWeight = inWeight ?? 0;
    this.outTangent = outTangent ?? 0;
    this.outWeight = outWeight ?? 0;
    this.weightedMode = weightedMode ?? TangentWeightMode.NONE;
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
    const weightedMode = isNumber(src.weightedMode)
      ? (src.weightedMode as TangentWeightMode)
      : undefined;
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

function isNumber(value: any): value is number {
  return typeof value == 'number';
}
