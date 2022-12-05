/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

import { RealCurve, _decorator } from 'cc';
import CubismSerializableKeyFrame from './CubismSerializableKeyFrame';
const { ccclass, property } = _decorator;

interface IRealKeyframeValue {
  value: number;
}

@ccclass('CubismSerializableCurve')
export default class CubismSerializableCurve {
  @property([CubismSerializableKeyFrame])
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

  public toRealCurve(): RealCurve {
    const { data } = this;
    const output = new RealCurve();
    for (let i = 0; i < data.length; i++) {
      const element = data[i];
      const key: IRealKeyframeValue = { value: element.value };
      key.value = element.value;
      output.addKeyFrame(element.time, element.value);
    }
    return output;
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
