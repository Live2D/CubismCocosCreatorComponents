/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

import { CanvasInfo, Model } from '../CubismCore';
import type CubismModel from './CubismModel';

/**
 * Single {@link CubismModel} canvas information.
 *
 * **Sealed class**
 */
export default class CubismCanvasInformation {
  private constructor(unmanagedModel: Model) {
    this.reset(unmanagedModel);
  }

  /**
   * Initializes instance.
   * @param unmanagedModel Handle to unmanaged model.
   */
  public static instantiate(unmanagedModel: Model): CubismCanvasInformation {
    return new CubismCanvasInformation(unmanagedModel);
  }

  private _unmanagedCanvasInformation: CanvasInfo | null = null;
  /** Unmanaged canvas information from unmanaged model. */
  private get unmanagedCanvasInformation(): CanvasInfo | null {
    return this._unmanagedCanvasInformation;
  }
  private set unmanagedCanvasInformation(value: CanvasInfo | null) {
    this._unmanagedCanvasInformation = value;
  }

  /** Width of native model canvas. */
  public get canvasWidth(): number {
    return this.unmanagedCanvasInformation?.CanvasWidth ?? 0;
  }

  /** Height of native model canvas. */
  public get canvasHeight(): number {
    return this.unmanagedCanvasInformation?.CanvasHeight ?? 0;
  }

  /** Coordinate origin of X axis. */
  public get canvasOriginX(): number {
    return this.unmanagedCanvasInformation?.CanvasOriginX ?? 0;
  }

  /** Coordinate origin of Y axis. */
  public get canvasOriginY(): number {
    return this.unmanagedCanvasInformation?.CanvasOriginY ?? 0;
  }

  /** Pixels per unit of native model. */
  public get pixelsPerUnit(): number {
    return this.unmanagedCanvasInformation?.PixelsPerUnit ?? 0;
  }

  /**
   * Revives the instance.
   * @param unmanagedModel Handle to unmanaged model.
   */
  public revive(unmanagedModel: Model): void {
    this.unmanagedCanvasInformation = unmanagedModel.canvasinfo;
  }

  /**
   * Restores instance to initial state.
   * @param unmanagedModel Handle to unmanaged model.
   */
  private reset(unmanagedModel: Model): void {
    this.revive(unmanagedModel);
  }
}
