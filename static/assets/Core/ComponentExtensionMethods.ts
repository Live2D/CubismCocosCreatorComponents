/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

import { _decorator, Component, Node } from 'cc';
import CubismModel from '../Core/CubismModel';

/** Extensions for {@link Component}s. */
namespace ComponentExtensionMethods {
  /**
   * Finds a {@link CubismModel} relative to a {@link Component}.
   * @param self Component to base search on.
   * @param includeParents Condition for including parents in search.
   * @returns The relative {@link CubismModel} if found; null otherwise.
   */
  export function findCubismModel(
    self: Component,
    includeParents: boolean = false
  ): CubismModel | null {
    // Validate arguments.
    if (self == null) {
      return null;
    }
    let model = self.getComponent(CubismModel);

    // Return model if found.
    if (model != null) {
      return model;
    }

    // Recursively search in parents if requested.
    if (includeParents) {
      // Scene 内 root node の Node.parent は Scene が入っているためnullにならない。
      for (
        let current: Node | null = self.node.parent;
        current != null && Node.isNode(current);
        current = current.parent
      ) {
        model = current.getComponent(CubismModel);
        if (model != null) {
          return model;
        }
      }
    }

    // Signal not found.
    return null;
  }
}
export default ComponentExtensionMethods;
