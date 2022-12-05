/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

import type CubismDrawable from '../Core/CubismDrawable';
import type CubismRenderController from './CubismRenderController';

namespace ICubismDrawOrderHandler {
  export const SYMBOL = Symbol('ICubismDrawOrderHandler');
  export function isImplements(obj: unknown): obj is ICubismDrawOrderHandler {
    if (obj == null || typeof obj != 'object') {
      return false;
    }
    return Reflect.has(obj, ICubismDrawOrderHandler.SYMBOL)
      ? Reflect.get(obj, ICubismDrawOrderHandler.SYMBOL) === SYMBOL
      : false;
  }
}

/** Allows listening to CubismDrawable draw order changes. */
interface ICubismDrawOrderHandler {
  readonly [ICubismDrawOrderHandler.SYMBOL]: typeof ICubismDrawOrderHandler.SYMBOL;

  /**
   * Called when a draw order did change.
   * @param controller The CubismRenderController.
   * @param drawable The CubismDrawable that draw order did change.
   * @param newDrawOrder New draw order.
   */
  onDrawOrderDidChange(
    controller: CubismRenderController,
    drawable: CubismDrawable,
    newDrawOrder: number
  ): void;
}
export default ICubismDrawOrderHandler;
