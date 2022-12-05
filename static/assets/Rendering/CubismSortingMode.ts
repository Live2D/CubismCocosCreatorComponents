/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

/** Core.CubismDrawable render sort modes. */
enum CubismSortingMode {
  /** Painter's algorithm sorting that works well with other Cocos Creator elements. Offsets by depth. */
  backToFrontZ,

  /** Offset by depth from front to back. */
  frontToBackZ,

  /** Offsets by Cocos Creator's sorting order from back to front. */
  backToFrontOrder,

  /** Offsets by Cocos Creator's sorting order from front to back. */
  frontToBackOrder,
}
namespace CubismSortingMode {
  /**
   * Checks whether a mode sorts by depth.
   * @param self Mode to query.
   * @returns true if mode sorts by depth; false otherwise.
   */
  export function sortByDepth(self: CubismSortingMode): boolean {
    return self == CubismSortingMode.backToFrontZ || self == CubismSortingMode.frontToBackZ;
  }

  /**
   * Checks whether a mode sorts by order.
   * @param self Mode to query.
   * @returns true if mode sorts by order; false otherwise.
   */
  export function sortByOrder(self: CubismSortingMode): boolean {
    return !sortByDepth(self);
  }
}
export default CubismSortingMode;
