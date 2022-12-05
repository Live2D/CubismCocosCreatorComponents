/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

import { Asset, CCObject, Component, Node } from 'cc';

/** Extensions for Objects. */
namespace ObjectExtensionMethods {
  /**
   * Extracts an interface from an Object.
   * @param T Interface type to extract.
   * @param self this.
   * @returns Valid reference on success; null otherwise.
   */
  export function getInterface<T extends object = object>(
    self: object,
    isImplementsFunc: (obj: object) => obj is T
  ): T | null {
    if (isImplementsFunc(self)) {
      return self;
    }
    // Deal with Nodes.
    if (!Node.isNode(self)) {
      return null;
    }
    let node = self as Node;
    const handlers = node
      .getComponents(Component)
      .filter((value, _index, _array) => isImplementsFunc(value)) as (T & Component)[];
    let result: T | null = null;
    if (handlers.length > 0) {
      result = handlers[0];
    }
    // Warn on error.
    if (result == null) {
      console.warn(self + " doesn't expose requested interface of type.");
    }
    return result;
  }

  /**
   * Nulls reference in case an Object doesn't expose an interface requested.
   * @param T Type of interface to check for.
   * @param self this.
   * @returns self if object exposes interface; null otherwise.
   */
  export function toNullUnlessImplementsInterface<T extends object = object>(
    self: unknown,
    isImplementsFunc: (obj: unknown) => obj is T
  ): T | Node | null {
    const exposesInterface = implementsInterface(self, isImplementsFunc);

    // Warn on error.
    if (!exposesInterface) {
      console.warn(self + " doesn't expose requested interface of type.");
    }

    return exposesInterface ? self : null;
  }

  /**
   * Checks whether a {@link CCObject} implements an interface.
   * @param T Interface type to check against.
   * @param self this.
   * @returns true if interface is exposed; false otherwise.
   */
  export function implementsInterface<T extends object = object>(
    self: unknown,
    isImplementsFunc: (obj: unknown) => obj is T
  ): self is T | Node {
    // Return early in case argument matches type.
    if (self == null) {
      return false;
    }
    if (isImplementsFunc(self)) {
      return true;
    }

    // Search in components in case object is a GameObject.
    if (Node.isNode(self)) {
      let comp = self as Node;
      if (comp != null) {
        return comp
          .getComponents(Component)
          .some((value, _index, _array) => isImplementsFunc(value));
      }
    }

    // Return on fail.
    return false;
  }
}
export default ObjectExtensionMethods;
