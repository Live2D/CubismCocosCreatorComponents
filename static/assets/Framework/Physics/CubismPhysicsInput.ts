/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

import { Enum, math, _decorator } from 'cc';
import CubismPhysicsMath from './CubismPhysicsMath';
import CubismPhysicsSourceComponent from './CubismPhysicsSourceComponent';
import type CubismPhysicsNormalization from './CubismPhysicsNormalization';
import type CubismParameter from '../../Core/CubismParameter';
const { property, ccclass } = _decorator;

type NormalizedParameterValueGetter = (
  targetTranslation: math.Vec2,
  targetAngle: number,
  parameter: CubismParameter,
  parameterValue: number,
  normalization: CubismPhysicsNormalization,
  weight: number
) => { translation: math.Vec2; angle: number; parameterValue: number };

/** Input data of physics. (struct) */

@ccclass('CubismPhysicsInput')
export default class CubismPhysicsInput {
  private getInputTranslationXFromNormalizedParameterValue(
    targetTranslation: math.Vec2,
    targetAngle: number,
    parameter: CubismParameter,
    parameterValue: number,
    normalization: CubismPhysicsNormalization,
    weight: number
  ): { translation: math.Vec2; angle: number; parameterValue: number } {
    const result = CubismPhysicsMath.normalize(
      parameter,
      parameterValue,
      normalization.position.minimum,
      normalization.position.maximum,
      normalization.position.default,
      this.isInverted
    );

    return {
      translation: new math.Vec2(
        targetTranslation.x + result.normalized * weight,
        targetTranslation.y
      ),
      angle: targetAngle,
      parameterValue: result.clamped,
    };
  }

  private getInputTranslationYFromNormalizedParameterValue(
    targetTranslation: math.Vec2,
    targetAngle: number,
    parameter: CubismParameter,
    parameterValue: number,
    normalization: CubismPhysicsNormalization,
    weight: number
  ): { translation: math.Vec2; angle: number; parameterValue: number } {
    const result = CubismPhysicsMath.normalize(
      parameter,
      parameterValue,
      normalization.position.minimum,
      normalization.position.maximum,
      normalization.position.default,
      this.isInverted
    );

    return {
      translation: new math.Vec2(
        targetTranslation.x,
        targetTranslation.y + result.normalized * weight
      ),
      angle: targetAngle,
      parameterValue: result.clamped,
    };
  }

  private getInputAngleFromNormalizedParameterValue(
    targetTranslation: math.Vec2,
    targetAngle: number,
    parameter: CubismParameter,
    parameterValue: number,
    normalization: CubismPhysicsNormalization,
    weight: number
  ): { translation: math.Vec2; angle: number; parameterValue: number } {
    const result = CubismPhysicsMath.normalize(
      parameter,
      parameterValue,
      normalization.angle.minimum,
      normalization.angle.maximum,
      normalization.angle.default,
      this.isInverted
    );

    return {
      translation: targetTranslation.clone(),
      angle: targetAngle + result.normalized * weight,
      parameterValue: result.clamped,
    };
  }

  public initializeGetter() {
    switch (this.sourceComponent) {
      case CubismPhysicsSourceComponent.X:
        {
          this.getNormalizedParameterValue =
            this.getInputTranslationXFromNormalizedParameterValue.bind(this);
        }
        break;
      case CubismPhysicsSourceComponent.Y:
        {
          this.getNormalizedParameterValue =
            this.getInputTranslationYFromNormalizedParameterValue.bind(this);
        }
        break;
      case CubismPhysicsSourceComponent.Angle:
        {
          this.getNormalizedParameterValue =
            this.getInputAngleFromNormalizedParameterValue.bind(this);
        }
        break;
      default:
        const neverCheck: never = this.sourceComponent;
        break;
    }
  }
  /** Parameter ID of source. */
  @property({ serializable: true })
  public sourceId: string | null = '';
  /** Scale of translation. */
  @property({ serializable: true })
  public scaleOfTranslation: math.Vec2 = math.Vec2.ZERO.clone();
  /** Scale of angle. */
  @property({ serializable: true })
  public angleScale: number = 0;
  /** Weight. */
  @property({ serializable: true })
  public weight: number = 0;
  /** Component of source. */
  @property({ type: Enum(CubismPhysicsSourceComponent), serializable: true })
  public sourceComponent: CubismPhysicsSourceComponent = CubismPhysicsSourceComponent.X;
  /** True if value is inverted; otherwise. */
  @property({ serializable: true })
  public isInverted: boolean = false;

  /** Source data from parameter. */
  @property({ serializable: false, visible: false })
  public source: CubismParameter | null = null;

  /** Function of getting normalized parameter value. */
  @property({ serializable: false, visible: false })
  public getNormalizedParameterValue: NormalizedParameterValueGetter | null = null;
}
