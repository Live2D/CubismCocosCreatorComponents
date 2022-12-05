/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

/** Determines the direction of a harmonic motion from its origin. */
enum CubismHarmonicMotionDirection {
  /** Motion to the left of the origin. */
  Left,
  /** Motion to the right of the origin. */
  Right,
  /** Centric left-right motion around the origin. */
  Centric,
}
export default CubismHarmonicMotionDirection;
