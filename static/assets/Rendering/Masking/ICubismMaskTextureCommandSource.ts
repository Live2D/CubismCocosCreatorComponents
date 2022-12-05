/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

import CubismMaskTile from './CubismMaskTile';
import ICubismMaskCommandSource from './ICubismMaskCommandSource';

/** Common interface for mask draw sources. */
export default interface ICubismMaskTextureCommandSource extends ICubismMaskCommandSource {
  /**
   * Queries the number of tiles needed by the source.
   * @returns The necessary number of tiles needed.
   */
  getNecessaryTileCount(): number;

  /**
   * Assigns the tiles.
   * @param value Tiles to assign.
   */
  setTiles(value: Array<CubismMaskTile>): void;
}
