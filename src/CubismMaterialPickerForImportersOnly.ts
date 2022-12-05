/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

import type { Material } from 'cc';
import type CubismDrawable from '../static/assets/Core/CubismDrawable';
import type CubismModel3Json from '../static/assets/Framework/Json/CubismModel3Json';

export default class CubismMaterialPickerForImportersOnly {
  private readonly unlit: Material | null;
  private readonly unlitAdditive: Material | null;
  private readonly unlitAdditiveCulling: Material | null;
  private readonly unlitAdditiveMasked: Material | null;
  private readonly unlitAdditiveMaskedCulling: Material | null;
  private readonly unlitAdditiveMaskedInverted: Material | null;
  private readonly unlitAdditiveMaskedInvertedCulling: Material | null;
  private readonly unlitCulling: Material | null;
  private readonly unlitMasked: Material | null;
  private readonly unlitMaskedCulling: Material | null;
  private readonly unlitMaskedInverted: Material | null;
  private readonly unlitMaskedInvertedCulling: Material | null;
  private readonly unlitMultiply: Material | null;
  private readonly unlitMultiplyCulling: Material | null;
  private readonly unlitMultiplyMasked: Material | null;
  private readonly unlitMultiplyMaskedCulling: Material | null;
  private readonly unlitMultiplyMaskedInverted: Material | null;
  private readonly unlitMultiplyMaskedInvertedCulling: Material | null;
  public constructor(
    unlit: Material | null,
    unlitAdditive: Material | null,
    unlitAdditiveCulling: Material | null,
    unlitAdditiveMasked: Material | null,
    unlitAdditiveMaskedCulling: Material | null,
    unlitAdditiveMaskedInverted: Material | null,
    unlitAdditiveMaskedInvertedCulling: Material | null,
    unlitCulling: Material | null,
    unlitMasked: Material | null,
    unlitMaskedCulling: Material | null,
    unlitMaskedInverted: Material | null,
    unlitMaskedInvertedCulling: Material | null,
    unlitMultiply: Material | null,
    unlitMultiplyCulling: Material | null,
    unlitMultiplyMasked: Material | null,
    unlitMultiplyMaskedCulling: Material | null,
    unlitMultiplyMaskedInverted: Material | null,
    unlitMultiplyMaskedInvertedCulling: Material | null
  ) {
    this.unlit = unlit;
    this.unlitAdditive = unlitAdditive;
    this.unlitAdditiveCulling = unlitAdditiveCulling;
    this.unlitAdditiveMasked = unlitAdditiveMasked;
    this.unlitAdditiveMaskedCulling = unlitAdditiveMaskedCulling;
    this.unlitAdditiveMaskedInverted = unlitAdditiveMaskedInverted;
    this.unlitAdditiveMaskedInvertedCulling = unlitAdditiveMaskedInvertedCulling;
    this.unlitCulling = unlitCulling;
    this.unlitMasked = unlitMasked;
    this.unlitMaskedCulling = unlitMaskedCulling;
    this.unlitMaskedInverted = unlitMaskedInverted;
    this.unlitMaskedInvertedCulling = unlitMaskedInvertedCulling;
    this.unlitMultiply = unlitMultiply;
    this.unlitMultiplyCulling = unlitMultiplyCulling;
    this.unlitMultiplyMasked = unlitMultiplyMasked;
    this.unlitMultiplyMaskedCulling = unlitMultiplyMaskedCulling;
    this.unlitMultiplyMaskedInverted = unlitMultiplyMaskedInverted;
    this.unlitMultiplyMaskedInvertedCulling = unlitMultiplyMaskedInvertedCulling;
  }
  private _pick(_sender: CubismModel3Json, drawable: CubismDrawable): Material | null {
    if (drawable.isDoubleSided) {
      if (drawable.blendAdditive) {
        return drawable.isMasked
          ? drawable.isInverted
            ? this.unlitAdditiveMaskedInverted
            : this.unlitAdditiveMasked
          : this.unlitAdditive;
      }

      if (drawable.multiplyBlend) {
        return drawable.isMasked
          ? drawable.isInverted
            ? this.unlitMultiplyMaskedInverted
            : this.unlitMultiplyMasked
          : this.unlitMultiply;
      }

      return drawable.isMasked
        ? drawable.isInverted
          ? this.unlitMaskedInverted
          : this.unlitMasked
        : this.unlit;
    }

    if (drawable.blendAdditive) {
      return drawable.isMasked
        ? drawable.isInverted
          ? this.unlitAdditiveMaskedInvertedCulling
          : this.unlitAdditiveMaskedCulling
        : this.unlitAdditiveCulling;
    }

    if (drawable.multiplyBlend) {
      return drawable.isMasked
        ? drawable.isInverted
          ? this.unlitMultiplyMaskedInvertedCulling
          : this.unlitMultiplyMaskedCulling
        : this.unlitMultiplyCulling;
    }

    return drawable.isMasked
      ? drawable.isInverted
        ? this.unlitMaskedInvertedCulling
        : this.unlitMaskedCulling
      : this.unlitCulling;
  }

  private __pick(sender: CubismModel3Json, drawable: CubismDrawable): Promise<Material | null> {
    return Promise.resolve(this._pick(sender, drawable));
  }

  public pick = this.__pick.bind(this);
}
