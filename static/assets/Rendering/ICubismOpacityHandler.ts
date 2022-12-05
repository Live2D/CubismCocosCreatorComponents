/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

import type CubismRenderController from './CubismRenderController';

namespace ICubismOpacityHandler {
  export const SYMBOL = Symbol('ICubismOpacityHandler');
  export function isImplements(obj: unknown): obj is ICubismOpacityHandler {
    if (obj == null || typeof obj != 'object') {
      return false;
    }
    return Reflect.has(obj, ICubismOpacityHandler.SYMBOL)
      ? Reflect.get(obj, ICubismOpacityHandler.SYMBOL) === SYMBOL
      : false;
  }
}

/** Allows listening to <see cref="CubismDrawable"/> draw order changes. */
interface ICubismOpacityHandler {
  readonly [ICubismOpacityHandler.SYMBOL]: typeof ICubismOpacityHandler.SYMBOL;

  /**
   * Called when opacity did change.
   * @param controller The CubismRenderController.
   * @param newOpacity New opacity.
   */
  onOpacityDidChange(controller: CubismRenderController, newOpacity: number): void;
}
export default ICubismOpacityHandler;
