/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

import { math } from 'cc';
import type IStructLike from '../IStructLike';

export interface IVector2 {
  readonly x: number;
  readonly y: number;
}
export interface IVector3 extends IVector2 {
  readonly z: number;
}
export interface IVector4 extends IVector3 {
  readonly w: number;
}

export class CubismVector2 implements IVector2, IStructLike<CubismVector2> {
  public readonly x: number;
  public readonly y: number;
  public constructor(args: { readonly x?: number; readonly y?: number } = {}) {
    this.x = args.x ?? 0;
    this.y = args.y ?? 0;
  }
  public copyWith(args: { readonly x?: number; readonly y?: number } = {}): CubismVector2 {
    return new CubismVector2({ x: args.x ?? this.x, y: args.y ?? this.y });
  }
  public equals(other: CubismVector2): boolean {
    return this === other ? true : this.x === other.x && this.y === other.y;
  }
  public strictEquals(other: CubismVector2): boolean {
    return this === other;
  }
  public toBuiltinType(): math.Vec2 {
    return new math.Vec2(this.x, this.y);
  }
}

export class CubismVector3 implements IVector3, IStructLike<CubismVector3> {
  public readonly x: number;
  public readonly y: number;
  public readonly z: number;

  public copyWith(
    args: { readonly x?: number; readonly y?: number; readonly z?: number } = {}
  ): CubismVector3 {
    return new CubismVector3(args.x ?? this.x, args.y ?? this.y, args.z ?? this.z);
  }
  public equals(other: CubismVector3): boolean {
    return this === other ? true : this.x === other.x && this.y === other.y && this.z === other.z;
  }
  public strictEquals(other: CubismVector3): boolean {
    return this === other;
  }
  public toBuiltinType(): math.Vec3 {
    return new math.Vec3(this.x, this.y, this.z);
  }
  public add(value: IVector3): CubismVector3 {
    return new CubismVector3(this.x + value.x, this.y + value.y, this.z + value.z);
  }
  public subtract(value: IVector3): CubismVector3 {
    return new CubismVector3(this.x - value.x, this.y - value.y, this.z - value.z);
  }
  public multiplySingle(value: number) {
    return new CubismVector3(this.x * value, this.y * value, this.z * value);
  }
  public sqrMagnitude(): number {
    return this.x * this.x + this.y * this.y + this.z + this.z;
  }
  public magnitude(): number {
    return Math.sqrt(this.sqrMagnitude());
  }
  public constructor(x: number, y: number, z: number) {
    this.x = x;
    this.y = y;
    this.z = z;
  }
  public static from(args: { readonly x?: number; readonly y?: number; readonly z?: number } = {}) {
    return new CubismVector3(args.x ?? 0, args.y ?? 0, args.z ?? 0);
  }
  public static ZERO = new CubismVector3(0, 0, 0);
}

export class CubismVector4 implements IVector4, IStructLike<CubismVector4> {
  public readonly x: number;
  public readonly y: number;
  public readonly z: number;
  public readonly w: number;
  public constructor(
    args: {
      readonly x?: number;
      readonly y?: number;
      readonly z?: number;
      readonly w?: number;
    } = {}
  ) {
    this.x = args.x ?? 0;
    this.y = args.y ?? 0;
    this.z = args.z ?? 0;
    this.w = args.w ?? 0;
  }
  public copyWith(
    args: {
      readonly x?: number;
      readonly y?: number;
      readonly z?: number;
      readonly w?: number;
    } = {}
  ): CubismVector4 {
    return new CubismVector4({
      x: args.x ?? this.x,
      y: args.y ?? this.y,
      z: args.z ?? this.z,
      w: args.w ?? this.w,
    });
  }
  public equals(other: CubismVector4): boolean {
    return this === other
      ? true
      : this.x === other.x && this.y === other.y && this.z === other.z && this.w === other.w;
  }
  public strictEquals(other: CubismVector4): boolean {
    return this === other;
  }
  public toBuiltinType(): math.Vec4 {
    return new math.Vec4(this.x, this.y, this.z, this.w);
  }
}
