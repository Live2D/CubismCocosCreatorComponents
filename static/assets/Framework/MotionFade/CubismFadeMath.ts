/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

namespace CubismFadeMath {
  export function getEasingSine(value: number): number {
    if (value < 0.0) return 0.0;
    if (value > 1.0) return 1.0;

    return 0.5 - 0.5 * Math.cos(value * Math.PI);
  }
}
export default CubismFadeMath;
