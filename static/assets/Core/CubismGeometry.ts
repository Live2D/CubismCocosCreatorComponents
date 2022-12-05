/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

import { geometry } from 'cc';
import IStructLike from '../IStructLike';
import { IVector3, CubismVector3 as Vector3 } from './CubismVector';

// https://github.com/Unity-Technologies/UnityCsReference/blob/0a2eeb7a72710d89cccdb6aeee8431d27ee99cd1/Runtime/Export/Geometry/Bounds.cs
export class CubismBounds implements IStructLike<CubismBounds> {

  private readonly cx: number;
  private readonly cy: number;
  private readonly cz: number;
  private readonly hw: number;
  private readonly hh: number;
  private readonly hd: number;

  public constructor(cx: number, cy: number, cz: number, hw: number, hh: number, hd: number) {
    this.cx = cx;
    this.cy = cy;
    this.cz = cz;
    this.hw = hw;
    this.hh = hh;
    this.hd = hd;
  }

  public center(): Vector3 {
    return new Vector3(this.cx, this.cy, this.cz);
  }

  public extents(): Vector3 {
    return new Vector3(this.hw, this.hh, this.hd);
  }

  public min(): Vector3 {
    return this.center().subtract(this.extents());
  }

  public max(): Vector3 {
    return this.center().add(this.extents());
  }

  public contains(point: IVector3): boolean {
    const min = this.min();
    const max = this.max();
    return (
      max.x >= point.x &&
      max.y >= point.y &&
      max.z >= point.z &&
      min.x <= point.x &&
      min.y <= point.y &&
      min.z <= point.z
    );
  }

  public copyWith(
    args: { cx?: number; cy?: number; cz?: number; hw?: number; hh?: number; hd?: number } = {}
  ): CubismBounds {
    return new CubismBounds(
      args.cx ?? this.cx,
      args.cy ?? this.cy,
      args.cz ?? this.cz,
      args.hw ?? this.hw,
      args.hh ?? this.hh,
      args.hd ?? this.hd
    );
  }

  public equals(other: CubismBounds): boolean {
    return this === other
      ? true
      : this.cx === other.cx &&
          this.cy === other.cy &&
          this.cz === other.cz &&
          this.hw === other.hw &&
          this.hh === other.hh &&
          this.hd === other.hd;
  }

  public strictEquals(other: CubismBounds): boolean {
    return this === other;
  }

  public toAABB(): geometry.AABB {
    return new geometry.AABB(this.cx, this.cy, this.cz, this.hw, this.hh, this.hd);
  }

  public static from6f(
    args: { cx?: number; cy?: number; cz?: number; hw?: number; hh?: number; hd?: number } = {}
  ) {
    return new CubismBounds(
      args.cx ?? 0,
      args.cy ?? 0,
      args.cz ?? 0,
      args.hw ?? 0,
      args.hh ?? 0,
      args.hd ?? 0
    );
  }

  public static fromVector(center: IVector3, size: IVector3) {
    return new CubismBounds(center.x, center.y, center.z, size.x * 0.5, size.y * 0.5, size.z * 0.5);
  }

  public static fromAABB(aabb: geometry.AABB) {
    return new CubismBounds(
      aabb.center.x,
      aabb.center.y,
      aabb.center.z,
      aabb.halfExtents.x,
      aabb.halfExtents.y,
      aabb.halfExtents.z
    );
  }
}
