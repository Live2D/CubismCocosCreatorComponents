/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

import { AssetManager, assetManager, Material, resources } from 'cc';

/** Default materials. */
namespace CubismBuiltinMaterials {
  /** Default unlit material. */
  export async function getUnlit() {
    const bundle = await getBundle();
    return bundle == null ? null : getMaterial(bundle, 'Unlit');
  }

  /** Default unlit, additively blending material. */
  export async function getUnlitAdditive() {
    const bundle = await getBundle();
    return bundle == null ? null : getMaterial(bundle, 'UnlitAdditive');
  }

  /** Default unlit culled, additively blending material. */
  export async function getUnlitAdditiveCulling() {
    const bundle = await getBundle();
    return bundle == null ? null : getMaterial(bundle, 'UnlitAdditiveCulling');
  }

  /** Default unlit masked, additively blending material. */
  export async function getUnlitAdditiveMasked() {
    const bundle = await getBundle();
    return bundle == null ? null : getMaterial(bundle, 'UnlitAdditiveMasked');
  }

  /** Default unlit masked culled, additively blending material. */
  export async function getUnlitAdditiveMaskedCulling() {
    const bundle = await getBundle();
    return bundle == null ? null : getMaterial(bundle, 'UnlitAdditiveMaskedCulling');
  }

  /** Default unlit masked inverted, additively blending material. */
  export async function getUnlitAdditiveMaskedInverted() {
    const bundle = await getBundle();
    return bundle == null ? null : getMaterial(bundle, 'UnlitAdditiveMaskedInverted');
  }

  /** Default unlit masked inverted culled, additively blending material. */
  export async function getUnlitAdditiveMaskedInvertedCulling() {
    const bundle = await getBundle();
    return bundle == null ? null : getMaterial(bundle, 'UnlitAdditiveMaskedInvertedCulling');
  }

  /** Default unlit culled material. */
  export async function getUnlitCulling() {
    const bundle = await getBundle();
    return bundle == null ? null : getMaterial(bundle, 'UnlitCulling');
  }

  /** Default unlit masked material. */
  export async function getUnlitMasked() {
    const bundle = await getBundle();
    return bundle == null ? null : getMaterial(bundle, 'UnlitMasked');
  }

  /** Default unlit masked culled material. */
  export async function getUnlitMaskedCulling() {
    const bundle = await getBundle();
    return bundle == null ? null : getMaterial(bundle, 'UnlitMaskedCulling');
  }

  /** Default unlit masked inverted material. */
  export async function getUnlitMaskedInverted() {
    const bundle = await getBundle();
    return bundle == null ? null : getMaterial(bundle, 'UnlitMaskedInverted');
  }

  /** Default unlit masked inverted culled material. */
  export async function getUnlitMaskedInvertedCulling() {
    const bundle = await getBundle();
    return bundle == null ? null : getMaterial(bundle, 'UnlitMaskedInvertedCulling');
  }

  /** Default unlit multiply material. */
  export async function getUnlitMultiply() {
    const bundle = await getBundle();
    return bundle == null ? null : getMaterial(bundle, 'UnlitMultiply');
  }

  /** Default unlit culled, multiply blending material. */
  export async function getUnlitMultiplyCulling() {
    const bundle = await getBundle();
    return bundle == null ? null : getMaterial(bundle, 'UnlitMultiplyCulling');
  }

  /** Default unlit masked, multiply blending material. */
  export async function getUnlitMultiplyMasked() {
    const bundle = await getBundle();
    return bundle == null ? null : getMaterial(bundle, 'UnlitMultiplyMasked');
  }

  /** Default unlit masked culled material. */
  export async function getUnlitMultiplyMaskedCulling() {
    const bundle = await getBundle();
    return bundle == null ? null : getMaterial(bundle, 'UnlitMultiplyMaskedCulling');
  }

  /** Default unlit masked inverted, multiply blending material. */
  export async function getUnlitMultiplyMaskedInverted() {
    const bundle = await getBundle();
    return bundle == null ? null : getMaterial(bundle, 'UnlitMultiplyMaskedInverted');
  }

  /** Default unlit masked inverted culled, multiply blending material. */
  export async function getUnlitMultiplyMaskedInvertedCulling() {
    const bundle = await getBundle();
    return bundle == null ? null : getMaterial(bundle, 'UnlitMultiplyMaskedInvertedCulling');
  }

  /** Default mask material. */
  export async function getMask(): Promise<Material | null> {
    const bundle = await getBundle();
    return bundle == null ? null : getMaterial(bundle, 'Mask');
  }

  /** Default culled mask material. */
  export async function getMaskCulling(): Promise<Material | null> {
    const bundle = await getBundle();
    return bundle == null ? null : getMaterial(bundle, 'MaskCulling');
  }

  // #region Helper Methods

  const BUNDLE_NAME = 'Live2DCubismBuiltinResource';

  async function getBundle(): Promise<AssetManager.Bundle | null> {
    const bundle = assetManager.bundles.get(BUNDLE_NAME);
    if (bundle != null) {
      return Promise.resolve(bundle);
    }
    return new Promise((resolve, reject) => {
      assetManager.loadBundle(BUNDLE_NAME, (error, bundle) => {
        if (error != null) {
          reject(null);
        } else {
          resolve(bundle);
        }
      });
    });
  }

  async function getMaterial(bundle: AssetManager.Bundle, name: string): Promise<Material | null> {
    const path = `Materials/${name}`;
    const mat = bundle.get<Material>(path);
    if (mat != null) {
      return Promise.resolve(mat);
    }
    return new Promise((resolve, reject) => {
      bundle.load<Material>(path, (error, asset) => {
        if (error != null) {
          reject(error);
        } else {
          resolve(asset);
        }
      });
    });
  }

  // #endregion
}
export default CubismBuiltinMaterials;
