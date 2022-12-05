/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

import { math } from 'cc';
import CubismMaskProperties from './CubismMaskProperties';
import CubismMaskRendererExtensionMethods from './CubismMaskRendererExtensionMethods';
import CubismMaskTile from './CubismMaskTile';
import CubismMaskTransform from './CubismMaskTransform';
import type CubismMaskTexture from './CubismMaskTexture';
import type CubismRenderer from '../CubismRenderer';
import type CubismMaskRenderer from './CubismMaskRenderer';
import type CubismMaskCommandBuffer from './CubismMaskCommandBuffer';

export default class CubismMaskMaskedJunction {
  private static _sharedMaskProperties: CubismMaskProperties;

  /** Shared buffer for CubismMaskPropertiess. */
  private static get sharedMaskProperties() {
    return this._sharedMaskProperties;
  }
  private static set sharedMaskProperties(value) {
    this._sharedMaskProperties = value;
  }

  private _masks: CubismMaskRenderer[] = new Array<CubismMaskRenderer>(0);

  /** Masks. */
  private get masks() {
    return this._masks;
  }
  private set masks(value) {
    this._masks = value;
  }

  private _maskeds: CubismRenderer[] = new Array<CubismRenderer>(0);

  /** Masked drawables. */
  private get maskeds() {
    return this._maskeds;
  }
  private set maskeds(value) {
    this._maskeds = value;
  }

  private _maskTexture: CubismMaskTexture | null = null;

  /** Mask texture to be referenced by Maskeds. */
  private get maskTexture() {
    return this._maskTexture;
  }
  private set maskTexture(value) {
    this._maskTexture = value;
  }

  private _maskTile: CubismMaskTile = new CubismMaskTile();

  /** Mask tile to write to and read from. */
  private get maskTile() {
    return this._maskTile;
  }
  private set maskTile(value) {
    this._maskTile = value;
  }

  private _maskTransform: CubismMaskTransform | null = null;

  /** Mask transform */
  private get maskTransform() {
    return this._maskTransform;
  }
  private set maskTransform(value) {
    this._maskTransform = value;
  }

  //#region Ctors

  /** Makes sure statics are initialized. */
  public constructor() {
    if (CubismMaskMaskedJunction.sharedMaskProperties != null) {
      return;
    }
    CubismMaskMaskedJunction.sharedMaskProperties = new CubismMaskProperties();
  }

  //#endregion

  //#region Interface For CubismMaskController

  /**
   * Sets the masks.
   * @param value Value to set.
   * @returns Instance.
   */
  public setMasks(value: Array<CubismMaskRenderer>): CubismMaskMaskedJunction {
    this.masks = value;
    return this;
  }

  /**
   * Sets the masked drawables.
   * @param value Value to set.
   * @returns Instance.
   */
  public setMaskeds(value: Array<CubismRenderer>): CubismMaskMaskedJunction {
    this.maskeds = value;
    return this;
  }

  /**
   * Sets the mask texture to read from.
   * @param value Value to set.
   * @returns Instance.
   */
  public setMaskTexture(value: CubismMaskTexture): CubismMaskMaskedJunction {
    this.maskTexture = value;
    return this;
  }

  /**
   * Sets the mask tile to write to and read from.
   * @param value Value to set.
   * @returns Instance.
   */
  public setMaskTile(value: CubismMaskTile): CubismMaskMaskedJunction {
    this.maskTile = value;
    return this;
  }

  /**
   * Appends junction draw commands to a buffer.
   * @param buffer Buffer to append commands to.
   */
  public addToCommandBuffer(buffer: CubismMaskCommandBuffer): void {
    // console.info('CubismMaskMaskedJunction.addToCommandBuffer()');
    // Make sure mask transform is initialized.
    this.recalculateMaskTransform();
    // Initialize and enqueue masks.
    const maskTile = this.maskTile;
    const maskTransform = this.maskTransform;
    if (maskTile == null) {
      console.error('CubismMaskMaskedJunction.addToCommandBuffer(): maskTile is null.');
      return;
    }
    if (maskTransform == null) {
      console.error('CubismMaskMaskedJunction.addToCommandBuffer(): maskTransform is null.');
      return;
    }
    for (let i = 0; i < this.masks.length; i++) {
      this.masks[i]
        .setMaskTile(maskTile)
        .setMaskTransform(maskTransform)
        .addToCommandBuffer(buffer);
    }
  }

  /** Updates the junction and all related data. */
  public update(): void {
    // Update mask transform.
    this.recalculateMaskTransform();
    // Apply transform to masks.
    console.assert(this.maskTransform);
    if (this.maskTransform == null) {
      return;
    }
    for (let i = 0; i < this.masks.length; i++) {
      this.masks[i].setMaskTransform(this.maskTransform);
    }
    // Apply transform and other properties to maskeds.
    const maskProperties = CubismMaskMaskedJunction.sharedMaskProperties;
    maskProperties.texture = this.maskTexture;
    maskProperties.tile = this.maskTile;
    maskProperties.transform = this.maskTransform;

    for (var i = 0; i < this.maskeds.length; i++) {
      this.maskeds[i].onMaskPropertiesDidChange(maskProperties);
    }
  }
  // #endregion

  /** Updates MaskTransform and Maskeds. */
  private recalculateMaskTransform(): void {
    // Compute bounds and scale.
    const bounds = CubismMaskRendererExtensionMethods.getBounds(this.masks);
    const extents = bounds.extents();
    const scale = extents.x > extents.y ? extents.x * 2 : extents.y * 2;
    // Compute mask transform.
    const center = bounds.center();
    this.maskTransform = new CubismMaskTransform({
      offset: new math.Vec2(center.x, center.y),
      scale: 1 / scale,
    });
  }
}
