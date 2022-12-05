/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

import { EffectAsset, resources } from 'cc';

/**
 * Default shader assets.
 */
export namespace CubismBuiltinShaders {
  /**
   * Default unlit shader.
   * @returns Default unlit shader EffectAsset Object
   */
  export async function getUnlit(): Promise<EffectAsset | null> {
    const assetPath = 'db://live2d_cubismsdk_cocoscreator/resources/Shaders/Unlit.effect';
    return new Promise<EffectAsset | null>((resolve, reject) => {
      resources.load<EffectAsset>(assetPath, (error, asset) => {
        if (error != null) {
          reject(null);
          return;
        }
        resolve(asset);
      });
    });
  }

  /**
   * Shader for drawing masks.
   * @returns Shader for drawing masks EffectAsset Object
   */
  export async function getMask(): Promise<EffectAsset | null> {
    const assetPath = 'db://live2d_cubismsdk_cocoscreator/resources/Shaders/Mask.effect';
    return new Promise<EffectAsset | null>((resolve, reject) => {
      resources.load<EffectAsset>(assetPath, (error, asset) => {
        if (error != null) {
          reject(null);
          return;
        }
        resolve(asset);
      });
    });
  }
}
