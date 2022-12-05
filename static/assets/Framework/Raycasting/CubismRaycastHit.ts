/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

import CubismDrawable from '../../Core/CubismDrawable';
import { CubismVector3 as Vector3 } from '../../Core/CubismVector';
import type IStructLike from '../../IStructLike';

/** Contains raycast information. */
export default class CubismRaycastHit implements IStructLike<CubismRaycastHit> {
  /** The hit {@link CubismDrawable} */
  public readonly drawable: CubismDrawable | null;

  /** The distance the ray traveled until it hit the {@link CubismDrawable}. */
  public readonly distance: number;

  /** The hit position local to the {@link CubismDrawable}. */
  public readonly localPosition: Vector3;

  /** The hit position in world coordinates. */
  public readonly worldPosition: Vector3;

  public constructor(
    args: {
      drawable?: CubismDrawable | null;
      distance?: number;
      localPosition?: Vector3;
      worldPosition?: Vector3;
    } = {}
  ) {
    this.drawable = args.drawable ?? null;
    this.distance = args.distance ?? 0;
    this.localPosition = args.localPosition ?? Vector3.ZERO;
    this.worldPosition = args.worldPosition ?? Vector3.ZERO;
  }

  public copyWith(
    args: {
      drawable?: CubismDrawable | null;
      distance?: number;
      localPosition?: Vector3;
      worldPosition?: Vector3;
    } = {}
  ): CubismRaycastHit {
    return new CubismRaycastHit({
      drawable: args.drawable !== undefined ? args.drawable : this.drawable,
      distance: args.distance ?? this.distance,
      localPosition: args.localPosition ?? this.localPosition,
      worldPosition: args.worldPosition ?? this.worldPosition,
    });
  }
  public equals(other: CubismRaycastHit): boolean {
    return this === other
      ? true
      : this.drawable === other.drawable &&
          this.distance == other.distance &&
          this.localPosition.equals(other.localPosition) &&
          this.worldPosition.equals(other.worldPosition);
  }
  public strictEquals(other: CubismRaycastHit): boolean {
    return this === other;
  }
}
