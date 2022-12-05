/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

import CubismBuiltinMaterials from '../../Rendering/CubismBuiltinMaterials';
import type { Material, Texture2D } from 'cc';
import type CubismModel3Json from './CubismModel3Json';
import type CubismDrawable from '../../Core/CubismDrawable';

/** Default pickers. */
namespace CubismBuiltinPickers {
  /**
   * Builtin Material picker.
   * @param sender Event source.
   * @param drawable Drawable to map to.
   * @returns Mapped texture.
   */
  export function materialPicker(
    _sender: CubismModel3Json,
    drawable: CubismDrawable
  ): Promise<Material | null> {
    if (drawable.isDoubleSided) {
      if (drawable.blendAdditive) {
        return drawable.isMasked
          ? drawable.isInverted
            ? CubismBuiltinMaterials.getUnlitAdditiveMaskedInverted()
            : CubismBuiltinMaterials.getUnlitAdditiveMasked()
          : CubismBuiltinMaterials.getUnlitAdditive();
      }

      if (drawable.multiplyBlend) {
        return drawable.isMasked
          ? drawable.isInverted
            ? CubismBuiltinMaterials.getUnlitMultiplyMaskedInverted()
            : CubismBuiltinMaterials.getUnlitMultiplyMasked()
          : CubismBuiltinMaterials.getUnlitMultiply();
      }

      return drawable.isMasked
        ? drawable.isInverted
          ? CubismBuiltinMaterials.getUnlitMaskedInverted()
          : CubismBuiltinMaterials.getUnlitMasked()
        : CubismBuiltinMaterials.getUnlit();
    }

    if (drawable.blendAdditive) {
      return drawable.isMasked
        ? drawable.isInverted
          ? CubismBuiltinMaterials.getUnlitAdditiveMaskedInvertedCulling()
          : CubismBuiltinMaterials.getUnlitAdditiveMaskedCulling()
        : CubismBuiltinMaterials.getUnlitAdditiveCulling();
    }

    if (drawable.multiplyBlend) {
      return drawable.isMasked
        ? drawable.isInverted
          ? CubismBuiltinMaterials.getUnlitMultiplyMaskedInvertedCulling()
          : CubismBuiltinMaterials.getUnlitMultiplyMaskedCulling()
        : CubismBuiltinMaterials.getUnlitMultiplyCulling();
    }

    return drawable.isMasked
      ? drawable.isInverted
        ? CubismBuiltinMaterials.getUnlitMaskedInvertedCulling()
        : CubismBuiltinMaterials.getUnlitMaskedCulling()
      : CubismBuiltinMaterials.getUnlitCulling();
  }

  /**
   * Builtin Texture2D picker.
   * @param sender Event source.
   * @param drawable Drawable to map to.
   * @returns Mapped texture.
   */
  export function texturePicker(
    sender: CubismModel3Json,
    drawable: CubismDrawable
  ): Promise<Texture2D | null> {
    return sender.getTexture(drawable.textureIndex);
  }
}
export default CubismBuiltinPickers;
