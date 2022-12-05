/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

import { _decorator, math, Enum } from 'cc';
import CubismPhysics from './CubismPhysics';
import CubismPhysicsMath from './CubismPhysicsMath';
import CubismPhysicsSourceComponent from './CubismPhysicsSourceComponent';
import type CubismPhysicsParticle from './CubismPhysicsParticle';
import type CubismParameter from '../../Core/CubismParameter';
import { MathExtensions } from '../../Utils';
const { property, ccclass } = _decorator;
const { Vec2 } = MathExtensions;

/**
 * Delegation of function of getting output value.
 * @param translation Translation.
 * @param parameter Parameter.
 * @param particles Particles.
 * @param particleIndex Index of particle.
 * @param gravity Gravity.
 * @returns Output value.
 */
type ValueGetter = (
  translation: math.Vec2,
  parameter: CubismParameter,
  particles: CubismPhysicsParticle[],
  particleIndex: number,
  gravity: math.Vec2
) => number;

/**
 * Delegation of function of getting output scale.
 * @returns Output scale.
 */
type ScaleGetter = () => number;

/** Output data of physics. (struct) */
@ccclass('CubismPhysicsOutput')
export default class CubismPhysicsOutput {
  /**
   * Gets output for translation X-axis.
   * @param translation Translation.
   * @param parameter Parameter.
   * @param particles Particles.
   * @param particleIndex Index of particle.
   * @param gravity Gravity.
   * @returns Output value.
   */
  private getOutputTranslationX(
    translation: math.Vec2,
    parameter: CubismParameter,
    particles: Array<CubismPhysicsParticle>,
    particleIndex: number,
    gravity: math.Vec2
  ): number {
    let outputValue = translation.x;
    if (this.isInverted) {
      outputValue *= -1.0;
    }
    return outputValue;
  }

  /**
   * Gets output for translation Y-axis.
   * @param translation Translation.
   * @param parameter Parameter.
   * @param particles Particles.
   * @param particleIndex Index of particle.
   * @param gravity Gravity.
   * @returns Output value.
   */
  private getOutputTranslationY(
    translation: math.Vec2,
    parameter: CubismParameter,
    particles: Array<CubismPhysicsParticle>,
    particleIndex: number,
    gravity: math.Vec2
  ): number {
    let outputValue = translation.y;
    if (this.isInverted) {
      outputValue *= -1.0;
    }
    return outputValue;
  }

  /**
   * Gets output for angle.
   * @param translation Translation.
   * @param parameter Parameter.
   * @param particles Particles.
   * @param particleIndex Index of particle.
   * @param gravity Gravity.
   * @returns Output value.
   */
  private getOutputAngle(
    translation: math.Vec2,
    parameter: CubismParameter,
    particles: Array<CubismPhysicsParticle>,
    particleIndex: number,
    gravity: math.Vec2
  ): number {
    let parentGravity = math.Vec2.ZERO;
    if (CubismPhysics.useAngleCorrection) {
      if (particleIndex < 2) {
        parentGravity = new math.Vec2(gravity.x, gravity.y * -1.0);
      } else {
        parentGravity = Vec2.subtract(
          particles[particleIndex - 1].position,
          particles[particleIndex - 2].position
        );
      }
    } else {
      parentGravity = new math.Vec2(gravity.x, gravity.y * -1.0);
    }
    let outputValue = CubismPhysicsMath.directionToRadian(parentGravity, translation);
    if (this.isInverted) {
      outputValue *= -1.0;
    }
    return outputValue;
  }

  /**
   * Gets output scale for translation X-axis.
   * @returns Output scale.
   */
  private getOutputScaleTranslationX(): number {
    return this.translationScale.x;
  }

  /**
   * Gets output scale for translation Y-axis.
   * @returns Output scale.
   */
  private getOutputScaleTranslationY(): number {
    return this.translationScale.y;
  }

  /**
   * Gets output scale for angle.
   * @returns Output scale.
   */
  private getOutputScaleAngle(): number {
    return this.angleScale;
  }

  public initializeGetter(): void {
    switch (this.sourceComponent) {
      case CubismPhysicsSourceComponent.X:
        {
          this.getScale = this.getOutputScaleTranslationX.bind(this);
          this.getValue = this.getOutputTranslationX.bind(this);
        }
        break;
      case CubismPhysicsSourceComponent.Y:
        {
          this.getScale = this.getOutputScaleTranslationY.bind(this);
          this.getValue = this.getOutputTranslationY.bind(this);
        }
        break;
      case CubismPhysicsSourceComponent.Angle:
        {
          this.getScale = this.getOutputScaleAngle.bind(this);
          this.getValue = this.getOutputAngle.bind(this);
        }
        break;
      default:
        const neverCheck: never = this.sourceComponent;
        break;
    }
  }

  /** Parameter ID of destination. */
  @property({ serializable: true })
  public destinationId: string | null = '';

  /** Index of particle. */
  @property({ serializable: true })
  public particleIndex: number = 0;

  /** Scale of transition. */
  @property({ serializable: true })
  public translationScale: math.Vec2 = math.Vec2.ZERO.clone();

  /** Scale of angle. */
  @property({ serializable: true })
  public angleScale: number = 0;

  /** Weight. */
  @property({ serializable: true })
  public weight: number = 0;

  /** Component of source. */
  @property({ type: Enum(CubismPhysicsSourceComponent), serializable: true, readonly: false })
  public sourceComponent: CubismPhysicsSourceComponent = CubismPhysicsSourceComponent.X;

  /** True if value is inverted; otherwise. */
  @property({ serializable: true })
  public isInverted: boolean = false;

  /** The value that below minimum. */
  public valueBelowMinimum: number = 0;

  /** The value that exceeds maximum. */
  public valueExceededMaximum: number = 0;

  /** Destination data from parameter. */
  public destination: CubismParameter | null = null;

  /** Function of getting output value. */
  public getValue: ValueGetter | null = null;

  /** Function of getting output scale. */
  public getScale: ScaleGetter | null = null;
}
