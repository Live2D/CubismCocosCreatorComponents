/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

import { _decorator } from 'cc';
import type IStructLike from '../../IStructLike';
const { property, ccclass } = _decorator;

/** Normalization tuplet. (struct) */
@ccclass('CubismPhysicsNormalizationTuplet')
export class CubismPhysicsNormalizationTuplet
  implements IStructLike<CubismPhysicsNormalizationTuplet>
{
  /** Normalized maximum value. */
  @property({ serializable: true })
  public readonly maximum: number = 0;

  /** Normalized minimum value. */
  @property({ serializable: true })
  public readonly minimum: number = 0;

  /** Normalized default value. */
  @property({ serializable: true })
  public readonly default: number = 0;

  public constructor(args: { maximum?: number; minimum?: number; defaultValue?: number } = {}) {
    this.maximum = args.maximum ?? 0;
    this.minimum = args.minimum ?? 0;
    this.default = args.defaultValue ?? 0;
  }

  public equals(other: CubismPhysicsNormalizationTuplet): boolean {
    return this === other
      ? true
      : this.default == other.default &&
          this.maximum == other.maximum &&
          this.minimum == this.minimum;
  }

  public strictEquals(other: CubismPhysicsNormalizationTuplet): boolean {
    return this === other;
  }

  public copyWith(
    args: { maximum?: number; minimum?: number; defaultValue?: number } = {}
  ): CubismPhysicsNormalizationTuplet {
    return new CubismPhysicsNormalizationTuplet({
      maximum: args.maximum ?? this.maximum,
      minimum: args.minimum ?? this.minimum,
      defaultValue: args.defaultValue ?? this.default,
    });
  }
}

/** Normalization parameters of physics. (struct) */
@ccclass('CubismPhysicsNormalization')
class CubismPhysicsNormalization implements IStructLike<CubismPhysicsNormalization> {
  /** Normalized position. */
  @property({ type: CubismPhysicsNormalizationTuplet, serializable: true })
  public readonly position: CubismPhysicsNormalizationTuplet;

  /** Normalized angle. */
  @property({ type: CubismPhysicsNormalizationTuplet, serializable: true })
  public readonly angle: CubismPhysicsNormalizationTuplet;

  public constructor(
    args: {
      position?: CubismPhysicsNormalizationTuplet;
      angle?: CubismPhysicsNormalizationTuplet;
    } = {}
  ) {
    this.position = args.position ?? new CubismPhysicsNormalizationTuplet();
    this.angle = args.angle ?? new CubismPhysicsNormalizationTuplet();
  }

  public equals(other: CubismPhysicsNormalization): boolean {
    return this === other
      ? true
      : this.angle.equals(other.angle) && this.position.equals(other.position);
  }
  public strictEquals(other: CubismPhysicsNormalization): boolean {
    return this === other;
  }
  public copyWith(
    args: {
      position?: CubismPhysicsNormalizationTuplet;
      angle?: CubismPhysicsNormalizationTuplet;
    } = {}
  ): CubismPhysicsNormalization {
    return new CubismPhysicsNormalization({
      position: args.position ?? this.position,
      angle: args.angle ?? this.angle,
    });
  }
}

namespace CubismPhysicsNormalization {
  export const DEFAULT = new CubismPhysicsNormalization();
}
export default CubismPhysicsNormalization;

export namespace CubismPhysicsNormalizationTuplet {
  export const DEFAULT = new CubismPhysicsNormalizationTuplet();
}
