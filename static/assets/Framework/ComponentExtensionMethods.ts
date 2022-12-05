/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

import type { Component, __private } from 'cc';

namespace ComponentExtensionMethods {
  export function getComponentsMany<T extends Component>(
    self: Component[],
    classConstructor: __private._types_globals__Constructor<T>
  ) {
    let components: Array<T> = new Array();

    for (let i = 0; i < self.length; i++) {
      const range = self[i].getComponents(classConstructor);

      // Skip empty ranges.
      if (range.length == 0) {
        continue;
      }

      components = components.concat(range);
    }

    return components;
  }

  /**
   * Adds a component to multiple objects.
   * @param self Array of objects.
   * @param classConstructor
   * @returns Added components.
   */
  export function addComponentEach<T extends Component>(
    self: Component[],
    classConstructor: __private._types_globals__Constructor<T>
  ) {
    const components = new Array<T>(self.length);

    for (let i = 0; i < self.length; ++i) {
      components[i] = self[i].node.addComponent(classConstructor);
      console.assert(components[i]);
    }

    return components;
  }
}
export default ComponentExtensionMethods;
