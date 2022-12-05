/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

import { Color } from 'cc';
import type CubismRenderController from './CubismRenderController';

namespace ICubismBlendColorHandler {
  export const SYMBOL = Symbol('ICubismBlendColorHandler');
  export function isImplements(obj: unknown): obj is ICubismBlendColorHandler {
    if (obj == null || typeof obj != 'object') {
      return false;
    }
    return Reflect.has(obj, ICubismBlendColorHandler.SYMBOL)
      ? Reflect.get(obj, ICubismBlendColorHandler.SYMBOL) === SYMBOL
      : false;
  }
}

/** Allows listening to CubismDrawable draw order changes. */
interface ICubismBlendColorHandler {
  readonly [ICubismBlendColorHandler.SYMBOL]: typeof ICubismBlendColorHandler.SYMBOL;

  /**
   * Called when a draw order did change.
   * @param controller The CubismRenderController.
   * @param drawable The CubismDrawable that draw order did change.
   * @param newDrawOrder New draw order.
   */
  onBlendColorDidChange(controller: CubismRenderController, newColors: Readonly<Color>[]): void;
}
export default ICubismBlendColorHandler;
