/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

import { math } from 'cc';
import type CubismParameter from '../../Core/CubismParameter';

/** Math utilities for physics. */
export default class CubismPhysicsMath {
  public static degreesToRadian(degrees: number): number {
    return (degrees / 180.0) * Math.PI;
  }

  /**
   * Gets angle from both vector direction.
   * @param from From vector.
   * @param to To vector.
   * @returns Angle of radian.
   */
  public static directionToRadian(from: math.Vec2, to: math.Vec2): number {
    const q1 = Math.atan2(to.y, to.x);
    const q2 = Math.atan2(from.y, from.x);

    return this.getAngleDiff(q1, q2);
  }

  public static getAngleDiff(q1: number, q2: number): number {
    let ret = q1 - q2;

    while (ret < -Math.PI) {
      ret += Math.PI * 2.0;
    }

    while (ret > Math.PI) {
      ret -= Math.PI * 2.0;
    }

    return ret;
  }

  public static radianToDirection(totalAngle: number): math.Vec2 {
    const ret = new math.Vec2(Math.sin(totalAngle), Math.cos(totalAngle));

    return ret;
  }

  private static getRangeValue(min: number, max: number): number {
    const maxValue = Math.max(min, max);
    const minValue = Math.min(min, max);
    return Math.abs(maxValue - minValue);
  }

  private static getDefaultValue(min: number, max: number): number {
    const minValue = Math.min(min, max);
    return minValue + CubismPhysicsMath.getRangeValue(min, max) / 2.0;
  }

  public static normalize(
    parameter: CubismParameter,
    parameterValue: number,
    normalizedMinimum: number,
    normalizedMaximum: number,
    normalizedDefault: number,
    isInverted: boolean = false
  ): { normalized: number; clamped: number } {
    let result = 0.0;

    const maxValue = Math.max(parameter.maximumValue, parameter.minimumValue);
    const minValue = Math.min(parameter.maximumValue, parameter.minimumValue);

    parameterValue = math.clamp(parameterValue, minValue, maxValue);

    const minNormValue = Math.min(normalizedMinimum, normalizedMaximum);
    const maxNormValue = Math.max(normalizedMinimum, normalizedMaximum);
    const middleNormValue = normalizedDefault;

    const middleValue = CubismPhysicsMath.getDefaultValue(minValue, maxValue);
    const paramValue = parameterValue - middleValue;
    switch (Math.sign(paramValue)) {
      case 1: {
        const nLength = maxNormValue - middleNormValue;
        const pLength = maxValue - middleValue;
        if (pLength != 0.0) {
          result = paramValue * (nLength / pLength);
          result += middleNormValue;
        }

        break;
      }
      case -1: {
        const nLength = minNormValue - middleNormValue;
        const pLength = minValue - middleValue;
        if (pLength != 0.0) {
          result = paramValue * (nLength / pLength);
          result += middleNormValue;
        }
        break;
      }
      case 0: {
        result = middleNormValue;
        break;
      }
    }

    return { normalized: isInverted ? result : result * -1.0, clamped: parameterValue };
  }
}
