/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

/** Component of source physical force. */
enum CubismPhysicsSourceComponent {
  /** Use X-axis position. */
  X,
  /** Use Y-axis position. */
  Y,
  /** Use angle. */
  Angle,
}

namespace CubismPhysicsSourceComponent {
  export function purse(text: string): CubismPhysicsSourceComponent | null {
    return _map.get(text) ?? null;
  }
  const _map = new Map<string, CubismPhysicsSourceComponent>([
    ['X', CubismPhysicsSourceComponent.X],
    ['Y', CubismPhysicsSourceComponent.Y],
    ['Angle', CubismPhysicsSourceComponent.Angle],
  ]);
}

export default CubismPhysicsSourceComponent;
