/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

import type CubismMaskCommandBuffer from './CubismMaskCommandBuffer';

/** Common interface for mask command sources. */
export default interface ICubismMaskCommandSource {
  /**
   * Called to enqueue source.
   * @param buffer Buffer to enqueue in.
   */
  addToCommandBuffer(buffer: CubismMaskCommandBuffer): void;
}
