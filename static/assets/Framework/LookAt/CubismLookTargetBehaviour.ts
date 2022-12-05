/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

import { Component, math, _decorator } from 'cc';
import ICubismLookTarget from './ICubismLookTarget';
const { ccclass } = _decorator;

/** Straight-forward {@link ICubismLookTarget} {@link Component}. */
@ccclass('CubismLookTargetBehaviour')
export default class CubismLookTargetBehaviour extends Component implements ICubismLookTarget {
  readonly [ICubismLookTarget.SYMBOL]: typeof ICubismLookTarget.SYMBOL = ICubismLookTarget.SYMBOL;

  //#region Implementation of ICubismLookTarget

  /**
   * Gets the position of the target.
   * @returns The position of the target in world space.
   */
  public getPosition(): Readonly<math.Vec3> {
    return this.node.worldPosition;
  }

  /**
   * Gets whether the target is active.
   * @returns true if the target is active; false otherwise.
   */
  public isActive(): boolean {
    return this.enabledInHierarchy;
  }

  //#endregion
}
