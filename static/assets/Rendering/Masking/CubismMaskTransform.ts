/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

import { math } from 'cc';
import type IStructLike from '../../IStructLike';

/** Holds info used for masking. (struct) */
class CubismMaskTransform implements IStructLike<CubismMaskTransform> {
  // #region Conversion

  /** UniqueId backing field. */
  private static _uniqueId: number = 0;

  // この内容だけ正しいか精査が必要。内容がUnityの仕様に基づく処理のため。
  // CubismToMaskClipPosの計算に影響を与えている？ 要調査
  /**
   * HACK Prevents dynamic batching of <see cref="CubismRenderer"/>s that are masked.
   *
   * As Unity transforms vertex positions into world space on dynamic batching,
   * and masking relies on vertex positions to be in local space,
   * masking isn't compatible with dynamic batching.
   *
   * Unity exposes a shader tag for disabling dynamic batching ("DynamicBatching"), but this would make it necessary for creating separate shaders...
   */
  private static get uniqueId() {
    // We just have to make sure consecutive drawables with the same mask aren't batched; having more than 1024 cases in a row seems pretty rare, so...
    if (this._uniqueId > 1024) {
      this._uniqueId = 0;
    }

    return this._uniqueId++;
  }

  /**
   * Converts a CubismMaskTransform to a Vector4.
   * @returns Value to convert.
   */
  // public static implicit operator Vector4(CubismMaskTransform value)
  public toVec4(): math.Vec4 {
    return new math.Vec4(this.offset.x, this.offset.y, this.scale, CubismMaskTransform.uniqueId);
  }

  // #endregion

  /** Offset in model space. */
  public readonly offset: Readonly<math.Vec2>;

  /** Scale in model space. */
  public readonly scale: number;

  public constructor(args: { offset?: Readonly<math.Vec2>; scale?: number } = {}) {
    this.offset = args.offset ?? math.Vec2.ZERO.clone();
    this.scale = args.scale ?? 0;
  }

  public equals(other: CubismMaskTransform): boolean {
    return this === other ? true : this.offset.equals(other.offset) && this.scale == other.scale;
  }

  public strictEquals(other: CubismMaskTransform): boolean {
    return this === other;
  }

  public copyWith(
    args: { offset?: Readonly<math.Vec2>; scale?: number } = {}
  ): CubismMaskTransform {
    return new CubismMaskTransform({
      offset: args.offset ?? this.offset,
      scale: args.scale ?? this.scale,
    });
  }
}

namespace CubismMaskTransform {
  export const DEFAULT = new CubismMaskTransform();
}
export default CubismMaskTransform;
