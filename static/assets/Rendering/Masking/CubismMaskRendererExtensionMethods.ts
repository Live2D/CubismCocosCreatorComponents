/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

import { CubismBounds as Bounds } from '../../Core/CubismGeometry';
import { CubismVector3 as Vector3 } from '../../Core/CubismVector';
import CubismMaskRenderer from './CubismMaskRenderer';

/** Extensions for CubismMaskRenderer. */
namespace CubismMaskRendererExtensionMethods {
  /**
   * Combines bounds of multiple CubismMaskRenderers.
   * @param self Renderers.
   * @returns Combined bounds.
   */
  export function getBounds(self: Array<CubismMaskRenderer>): Bounds {
    let { x: minX, y: minY, z: minZ } = self[0].meshBounds.min();
    let { x: maxX, y: maxY, z: maxZ } = self[0].meshBounds.max();

    for (let i = 1; i < self.length; i++) {
      {
        const { x, y } = self[i].meshBounds.min();
        if (x < minX) {
          minX = x;
        }
        if (y < minY) {
          minY = y;
        }
      }
      {
        const { x, y } = self[i].meshBounds.max();
        if (x > maxX) {
          maxX = x;
        }
        if (y > maxY) {
          maxY = y;
        }
      }
    }

    const min = new Vector3(minX, minY, minZ);
    const size = new Vector3(maxX, maxY, maxZ).subtract(min);
    return Bounds.fromVector(size.multiplySingle(0.5).add(min), size);
  }
}
export default CubismMaskRendererExtensionMethods;
