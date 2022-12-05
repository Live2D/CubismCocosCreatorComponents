/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

export class CubismFadeMotionListSerializedAsset {
  public readonly motionInstanceIds: number[];
  public readonly cubismFadeMotionObjects: string[];
  private constructor(motionInstanceIds: number[], cubismFadeMotionObjects: string[]) {
    this.motionInstanceIds = motionInstanceIds;
    this.cubismFadeMotionObjects = cubismFadeMotionObjects;
  }
  public static instantiateFromJson(json: any): CubismFadeMotionListSerializedAsset | undefined {
    if (json == null) {
      return undefined;
    }
    const motionInstanceIds = MotionInstanceIds.instantiateFromJson(json.motionInstanceIds);
    const cubismFadeMotionObjects = CubismFadeMotionObjects.instantiateFromJson(
      json.cubismFadeMotionObjects
    );
    if (motionInstanceIds === undefined || cubismFadeMotionObjects === undefined) {
      console.error('json parsing error.');
      return undefined;
    }
    return new CubismFadeMotionListSerializedAsset(motionInstanceIds, cubismFadeMotionObjects);
  }
}

namespace MotionInstanceIds {
  export function instantiateFromJson(json: any): number[] | undefined {
    const cubismFadeMotionObjects = Array.isArray(json) ? (json as any[]) : undefined;
    if (cubismFadeMotionObjects == undefined) {
      return undefined;
    }
    if (cubismFadeMotionObjects.every<number>((e, _i, _a): e is number => typeof e == 'number')) {
      return cubismFadeMotionObjects;
    }
    return undefined;
  }
}

namespace CubismFadeMotionObjects {
  export function instantiateFromJson(json: any): string[] | undefined {
    const cubismFadeMotionObjects = Array.isArray(json) ? (json as any[]) : undefined;
    if (cubismFadeMotionObjects == undefined) {
      return undefined;
    }
    if (cubismFadeMotionObjects.every<string>((e, _i, _a): e is string => typeof e == 'string')) {
      return cubismFadeMotionObjects;
    }
    return undefined;
  }
}
