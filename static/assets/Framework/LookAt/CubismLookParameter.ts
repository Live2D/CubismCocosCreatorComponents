/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

import { CCFloat, Component, Enum, math, _decorator } from 'cc';
import CubismParameter from '../../Core/CubismParameter';
import CubismLookAxis from './CubismLookAxis';
const { ccclass, property } = _decorator;

/**
 * Look at parameter.
 *
 * **Sealed class**
 */
@ccclass('CubismLookParameter')
export default class CubismLookParameter extends Component {
  /** Look axis. */
  @property({ type: Enum(CubismLookAxis), serializable: true, visible: true })
  public axis: CubismLookAxis = CubismLookAxis.X;

  /** Factor. */
  @property({ type: CCFloat, serializable: true, visible: true })
  public factor: number = 0;

  //#region Cocos Creator Event Handling

  /** Called by Cocos Creator. Guesses best settings. */
  private reset(): void {
    const parameter = this.getComponent(CubismParameter);

    // Fail silently.
    if (parameter == null) {
      return;
    }

    // Guess axis.
    if (endsWith(parameter.name, 'Y')) {
      this.axis = CubismLookAxis.Y;
    } else if (endsWith(parameter.name, 'Z')) {
      this.axis = CubismLookAxis.Z;
    } else {
      this.axis = CubismLookAxis.X;
    }

    // Guess factor.
    this.factor = parameter.maximumValue;
  }

  //#endregion

  //#region Interface for Controller

  /**
   * Updates and evaluates the instance.
   * @param targetOffset Delta to target.
   * @returns Evaluation result.
   */
  public tickAndEvaluate(targetOffset: math.Vec3): number {
    const result =
      this.axis == CubismLookAxis.X
        ? targetOffset.x
        : this.axis == CubismLookAxis.Z
        ? targetOffset.z
        : targetOffset.y;
    return result * this.factor;
  }

  //#endregion
}

function endsWith(str: string, value: string) {
  return str.length > 0 ? str[str.length - 1] == value : false;
}
