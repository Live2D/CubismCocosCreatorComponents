/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

import CubismMaskTile from './CubismMaskTile';
import CubismMaskTransform from './CubismMaskTransform';
import type CubismMaskTexture from './CubismMaskTexture';

/**
 * Holds mask properties.
 *
 * **Sealed class.**
 */
export default class CubismMaskProperties {
  /** RenderTexture to draw masks */
  public texture: CubismMaskTexture | null = null;

  /** Tile where masks are drawn on Texture */
  public tile: CubismMaskTile = new CubismMaskTile();

  /** Transform info to draw masks on Texture */
  public transform: CubismMaskTransform = new CubismMaskTransform();
}
