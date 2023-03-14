/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

import { math } from 'cc';

/** Global variables of physics. */
namespace CubismPhysics {
  /** Default gravity. */
  export const gravity: Readonly<math.Vec2> = new math.Vec2(0, -1);
  /** Default direction of wind. */
  export const wind: Readonly<math.Vec2> = math.Vec2.ZERO;
  /** Air resistance. */
  export const airResistance: number = 5.0;
  /** Physical maximum weight. */
  export const maximumWeight: number = 100.0;
  /** Use fixed delta time. */
  export const useFixedDeltaTime: boolean = false;
  /** Use angle correction. */
  export const useAngleCorrection = true;
  /** Threshold of moving. */
  export const movementThreshold: number = 0.001;
  /** Constant of maximum allowed delta time */
  export const maxDeltaTime: number = 5.0;
}
export default CubismPhysics;
