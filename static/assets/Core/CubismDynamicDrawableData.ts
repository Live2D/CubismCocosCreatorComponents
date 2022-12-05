/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

import { math } from 'cc';
import { Utils } from '../CubismCore';
import type { Model } from '../CubismCore';
import type CubismDrawable from './CubismDrawable';

/**
 * Dynamic {@link CubismDrawable} data.
 *
 * **Sealed class.**
 */
export default class CubismDynamicDrawableData {
  private constructor(vertexPositions: Readonly<math.Vec3>[]) {
    this.vertexPositions = vertexPositions;
  }

  // #region Factory Methods

  /**
   * Creates buffer for dynamic {@link CubismDrawable} data.
   * @param unmanagedModel Unmanaged model to create buffer for.
   * @returns Buffer.
   */
  public static createData(unmanagedModel: Model): Array<CubismDynamicDrawableData> {
    const unmanagedDrawables = unmanagedModel.drawables;
    const buffer = new Array<CubismDynamicDrawableData>(unmanagedDrawables.count);

    // Initialize buffers.
    const vertexCounts = unmanagedDrawables.vertexCounts;

    for (let i = 0; i < buffer.length; i++) {
      const arr = new Array<Readonly<math.Vec3>>(vertexCounts[i]);
      for (let j = 0; j < arr.length; j++) {
        arr[j] = math.Vec3.ZERO.clone();
      }
      buffer[i] = new CubismDynamicDrawableData(arr);
    }
    return buffer;
  }

  // #endregion

  private _flags: number = 0;
  /** Dirty flags. */
  public get flags(): number {
    return this._flags;
  }
  public set flags(value: number) {
    this._flags = value;
  }

  private _opacity: number = 0;
  /** Current opacity. */
  public get opacity(): number {
    return this._opacity;
  }
  public set opacity(value: number) {
    this._opacity = value;
  }

  private _drawOrder: number = 0;
  /** Current draw order. */
  public get drawOrder(): number {
    return this._drawOrder;
  }
  public set drawOrder(value: number) {
    this._drawOrder = value;
  }

  private _renderOrder: number = 0;
  /** Current render order. */
  public get renderOrder(): number {
    return this._renderOrder;
  }
  public set renderOrder(value: number) {
    this._renderOrder = value;
  }

  private _vertexPositions: Array<Readonly<math.Vec3>> = new Array(0);
  /** Current vertex position. */
  public get vertexPositions(): Array<Readonly<math.Vec3>> {
    return this._vertexPositions;
  }
  public set vertexPositions(value: Array<Readonly<math.Vec3>>) {
    this._vertexPositions = value;
  }

  private _multiplyColor: Readonly<math.Color> = math.Color.WHITE;
  /** Current multiply color. */
  public get multiplyColor(): Readonly<math.Color> {
    return this._multiplyColor;
  }
  public set multiplyColor(value: Readonly<math.Color>) {
    this._multiplyColor = value;
  }

  private _screenColor: Readonly<math.Color> = math.Color.BLACK;
  /** Current screen color. */
  public get screenColor(): Readonly<math.Color> {
    return this._screenColor;
  }
  public set screenColor(value: Readonly<math.Color>) {
    this._screenColor = value;
  }

  /** True if currently visible. */
  public get isVisible(): boolean {
    return Utils.hasIsVisibleBit(this.flags);
  }

  /** True if {@link isVisible} did change. */
  public get isVisibilityDirty(): boolean {
    return Utils.hasVisibilityDidChangeBit(this.flags);
  }

  /** True if {@link opacity} did change. */
  public get isOpacityDirty(): boolean {
    return Utils.hasOpacityDidChangeBit(this.flags);
  }

  /** True if {@link drawOrder} did change. */
  public get isDrawOrderDirty(): boolean {
    return Utils.hasDrawOrderDidChangeBit(this.flags);
  }

  /** True if {@link renderOrder} did change. */
  public get isRenderOrderDirty(): boolean {
    return Utils.hasRenderOrderDidChangeBit(this.flags);
  }

  /** True if {@link vertexPositions} did change. */
  public get areVertexPositionsDirty(): boolean {
    return Utils.hasVertexPositionsDidChangeBit(this.flags);
  }

  /** True if {@link multiplyColor} and {@link screenColor} did change. */
  public get isBlendColorDirty(): boolean {
    return Utils.hasBlendColorDidChangeBit(this.flags);
  }

  /** True if any data did change. */
  public get isAnyDirty(): boolean {
    return this.flags != 0;
  }
}
