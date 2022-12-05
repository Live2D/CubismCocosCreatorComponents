/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

import { CubismBounds as Bounds } from '../Core/CubismGeometry';
import { CubismVector3 as Vector3 } from '../Core/CubismVector';
import type CubismRenderer from './CubismRenderer';

/** Array extension methods. */
export namespace ArrayExtensionMethods {
  /**
   * Combines bounds of multiple CubismRenderers.
   * @param self Renderers.
   * @returns Combined bounds.
   */
  export function getMeshRendererBounds(self: Array<CubismRenderer>): Bounds {
    const bounds = self[0].mesh.calculateBounds();
    let { x: minX, y: minY, z: minZ } = bounds.min();
    let { x: maxX, y: maxY, z: maxZ } = bounds.max();

    for (let i = 1; i < self.length; i++) {
      const boundsI = self[i].mesh.calculateBounds();
      {
        const { x, y } = boundsI.min();
        if (x < minX) {
          minX = x;
        }
        if (y < minY) {
          minY = y;
        }
      }
      {
        const { x, y } = boundsI.max();
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
