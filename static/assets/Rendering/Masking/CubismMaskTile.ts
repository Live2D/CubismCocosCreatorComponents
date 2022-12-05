/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

import { math } from 'cc';
import type IStructLike from '../../IStructLike';

/** Single mask tile. (struct) */
class CubismMaskTile implements IStructLike<CubismMaskTile> {
  // #region Conversion

  /**
   * Converts a CubismMaskTile to a Vector4.
   * @returns
   */
  public toVec4(): math.Vec4 {
    return new math.Vec4(this.channel, this.column, this.row, this.size);
  }

  // #endregion

  /**
   * Color channel of the tile.
   *
   * Valid values are 0f, 1f, 2, and 3f.
   */
  public readonly channel: number;

  /** Column index of the tile in subdivided texture. */
  public readonly column: number;

  /** Row index of the tile in subdivided texture. */
  public readonly row: number;

  /** Size of the tile in texture coordinates. */
  public readonly size: number;

  public constructor(
    args: { channel?: number; column?: number; row?: number; size?: number } = {}
  ) {
    this.channel = args.channel ?? 0;
    this.column = args.column ?? 0;
    this.row = args.row ?? 0;
    this.size = args.size ?? 0;
  }

  public copyWith(
    args: { channel?: number; column?: number; row?: number; size?: number } = {}
  ): CubismMaskTile {
    return new CubismMaskTile({
      channel: args.channel ?? this.channel,
      column: args.column ?? this.column,
      row: args.row ?? this.row,
      size: args.size ?? this.size,
    });
  }

  public equals(other: CubismMaskTile): boolean {
    return this === other
      ? true
      : this.channel == other.channel &&
          this.column == other.column &&
          this.row == other.row &&
          this.size == other.size;
  }

  public strictEquals(other: CubismMaskTile): boolean {
    return this === other;
  }

  public static isEquals(a: CubismMaskTile, b: CubismMaskTile) {
    return a.equals(b);
  }
}

namespace CubismMaskTile {
  export const DEFAULT = new CubismMaskTile();
}

export default CubismMaskTile;
