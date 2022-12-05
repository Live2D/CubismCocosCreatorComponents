/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

import { assetManager, Material } from 'cc';
import { EDITOR } from 'cc/env';
import { isImporter } from '../Utils';

let _maskMaterial: Material | null = null;
let _maskCullingMaterial: Material | null = null;

namespace CubismResources {
  export function getMaskMaterial(): Material | null {
    return _maskMaterial;
  }
  export function getMaskCullingMaterial(): Material | null {
    return _maskCullingMaterial;
  }
}

export default CubismResources;

if (!EDITOR) {
  assetManager.loadBundle('Live2DCubismBuiltinResource', (error, bundle) => {
    if (error != null) {
      console.error(error);
    } else {
      bundle.load<Material>('Materials/Mask', (error, asset) => {
        if (error != null) {
          console.error(error);
        } else {
          console.info('Initialize success.');
          _maskMaterial = asset;
        }
      });
      bundle.load<Material>('Materials/MaskCulling', (error, asset) => {
        if (error != null) {
          console.error(error);
        } else {
          _maskCullingMaterial = asset;
        }
      });
    }
  });
} else {
  if (!isImporter()) {
    const mask = await Editor.Message.request(
      'asset-db',
      'query-uuid',
      'db://live2d_cubismsdk_cocoscreator/resources/Materials/Mask.mtl'
    );
    const maskCulling = await Editor.Message.request(
      'asset-db',
      'query-uuid',
      'db://live2d_cubismsdk_cocoscreator/resources/Materials/MaskCulling.mtl'
    );
    assetManager.loadAny(mask, null, (error, asset) => {
      if (error) {
        console.error(error);
      } else {
        _maskMaterial = asset;
      }
    });
    assetManager.loadAny(maskCulling, null, (error, asset) => {
      if (error) {
        console.error(error);
      } else {
        _maskCullingMaterial = asset;
      }
    });
  }
}
