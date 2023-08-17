/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

import { CCFloat, CCInteger, Color, math, Mesh, primitives, utils, _decorator } from 'cc';
import { CubismBounds as Bounds } from '../Core/CubismGeometry';
const { ccclass, property } = _decorator;

@ccclass('CubismMeshPrimitive')
export default class CubismMeshPrimitive {
  @property({ type: [CCFloat] })
  private _rawPositions: number[] = new Array<number>();
  @property({ type: [CCFloat] })
  private _rawUvs: number[] = new Array<number>();
  @property({ type: [CCFloat] })
  private _rawColors: number[] = new Array<number>();
  @property({ type: [CCInteger] })
  private _rawIndices: number[] = new Array<number>();

  public get indexCount(): number {
    return this._rawIndices.length;
  }

  public setColors(source: ArrayLike<Color>) {
    this._rawColors.length = source.length * 4;
    for (let i = 0; i < source.length; i++) {
      this._rawColors[i * 4 + 0] = source[i].x;
      this._rawColors[i * 4 + 1] = source[i].y;
      this._rawColors[i * 4 + 2] = source[i].z;
      this._rawColors[i * 4 + 3] = source[i].w;
    }
  }

  public setColorsFromRaw(source: ArrayLike<number>) {
    this._rawColors.length = source.length;
    for (let i = 0; i < source.length; i++) {
      this._rawColors[i] = source[i];
    }
  }

  public getIndices(): ArrayLike<number> {
    return this._rawIndices;
  }

  public setIndices(source: ArrayLike<number>) {
    this._rawIndices.length = source.length;
    for (let i = 0; i < source.length; i++) {
      this._rawIndices[i] = source[i];
    }
  }

  private constructor(
    positions: number[] = [],
    uvs: number[] = [],
    colors: number[] = [],
    indices: number[] = []
  ) {
    this._rawPositions = positions;
    this._rawUvs = uvs;
    this._rawColors = colors;
    this._rawIndices = indices;
  }

  public static from(
    positions: ArrayLike<number>,
    uvs: ArrayLike<number>,
    colors: ArrayLike<number>
  ): CubismMeshPrimitive | null {
    const count = positions.length / 3;
    if (count != uvs.length / 2 || count != colors.length / 4) {
      return null;
    }
    const instance = new CubismMeshPrimitive(
      Array.from(positions),
      Array.from(uvs),
      Array.from(colors)
    );
    return instance;
  }

  public static makeEmpty(): CubismMeshPrimitive {
    return new CubismMeshPrimitive([], [], []);
  }

  public get vertexCount(): number {
    return this._rawPositions.length / 3;
  }

  public getPositions(): math.Vec3[] {
    const raw = this._rawPositions;
    const positions = new Array<math.Vec3>(raw.length / 3);
    for (let i = 0; i < positions.length; i++) {
      const j = i * 3;
      positions[i] = new math.Vec3(raw[j + 0], raw[j + 1], raw[j + 2]);
    }
    return positions;
  }

  public setPositions(source: readonly math.IVec3Like[]): void;
  public setPositions(source: ArrayLike<math.IVec3Like>): void;
  public setPositions(source: ArrayLike<math.IVec3Like>): void {
    this._rawPositions.length = source.length * 3;
    for (let i = 0; i < source.length; i++) {
      this._rawPositions[i * 3 + 0] = source[i].x;
      this._rawPositions[i * 3 + 1] = source[i].y;
      this._rawPositions[i * 3 + 2] = source[i].z;
    }
  }

  public getUvs(): math.Vec2[] {
    const raw = this._rawUvs;
    const uvs = new Array<math.Vec2>(raw.length / 4);
    for (let i = 0; i < uvs.length; i++) {
      const j = i * 2;
      uvs[i] = new math.Vec2(raw[j + 0], raw[j + 1]);
    }
    return uvs;
  }

  public getColors(): Color[] {
    const raw = this._rawColors;
    const colors = new Array<Color>(raw.length / 4);
    for (let i = 0; i < colors.length; i++) {
      const j = i * 4;
      colors[i] = new Color(raw[j + 0], raw[j + 1], raw[j + 2], raw[j + 3]);
    }
    return colors;
  }

  public createRuntimeMeshPrimitive(): primitives.IGeometry {
    return {
      positions: this._rawPositions,
      uvs: this._rawUvs,
      colors: this._rawColors,
      indices: this._rawIndices,
    };
  }

  public createMesh(): Mesh | null {
    return this._rawPositions.length == 0
      ? null
      : utils.MeshUtils.createMesh(this.createRuntimeMeshPrimitive(), undefined, {
          calculateBounds: true,
        });
  }

  public calculateBounds(): Bounds {
    const positions = this._rawPositions;
    if (positions.length == 0) {
      return new Bounds(0, 0, 0, 0, 0, 0);
    }
    const min = {
      x: positions[0],
      y: positions[1],
      z: positions[2],
    };
    const max = {
      x: min.x,
      y: min.y,
      z: min.z,
    };
    const count = Math.trunc(positions.length / 3);
    for (let i = 1; i < count; i++) {
      const x = positions[i * 3 + 0];
      const y = positions[i * 3 + 1];
      const z = positions[i * 3 + 2];

      min.x = x < min.x ? x : min.x;
      min.y = y < min.y ? y : min.y;
      min.z = z < min.z ? z : min.z;
      max.x = x > max.x ? x : max.x;
      max.y = y > max.y ? y : max.y;
      max.z = z > max.z ? z : max.z;
    }
    const o = { x: 0, y: 0, z: 0 };
    math.Vec3.lerp(o, min, max, 0.5);
    return new Bounds(
      o.x,
      o.y,
      o.z,
      (max.x - min.x) * 0.5,
      (max.y - min.y) * 0.5,
      (max.z - min.z) * 0.5
    );
  }
}
