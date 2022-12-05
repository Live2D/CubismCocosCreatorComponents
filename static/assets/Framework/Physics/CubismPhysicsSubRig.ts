/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

import { math, _decorator } from 'cc';
import ArrayExtensionMethods from '../../Core/ArrayExtensionMethods';
import CubismPhysics from './CubismPhysics';
import CubismPhysicsInput from './CubismPhysicsInput';
import CubismPhysicsMath from './CubismPhysicsMath';
import CubismPhysicsNormalization from './CubismPhysicsNormalization';
import CubismPhysicsOutput from './CubismPhysicsOutput';
import CubismPhysicsParticle from './CubismPhysicsParticle';
import type CubismPhysicsRig from './CubismPhysicsRig';
import type CubismParameter from '../../Core/CubismParameter';
import { MathExtensions } from '../../Utils';
import { EDITOR } from 'cc/env';
const { property, ccclass } = _decorator;
const { Vec2 } = MathExtensions;

@ccclass('CubismPhysicsSubRig')
export default class CubismPhysicsSubRig {
  @property({ type: [CubismPhysicsInput], serializable: true })
  public input: Array<CubismPhysicsInput> = [];

  @property({ type: [CubismPhysicsOutput], serializable: true })
  public output: Array<CubismPhysicsOutput> = [];

  @property({ type: [CubismPhysicsParticle], serializable: true })
  public particles: Array<CubismPhysicsParticle> = [];

  @property({ type: CubismPhysicsNormalization, serializable: true })
  public normalization: CubismPhysicsNormalization | null = null;

  @property({ serializable: false })
  private _rig: CubismPhysicsRig | null = null;
  public get rig() {
    return this._rig;
  }
  public set rig(value: CubismPhysicsRig | null) {
    this._rig = value;
  }

  private updateOutputParameterValue(
    parameter: CubismParameter,
    translation: number,
    output: CubismPhysicsOutput
  ) {
    let outputScale: number = 1.0;

    if (output.getScale == null) {
      console.error('CubismPhysicsSubRig.updateOutputParameterValue(): getScale function is null.');
      return;
    }

    outputScale = output.getScale();

    let value = translation * outputScale;

    if (value < parameter.minimumValue) {
      if (value < output.valueBelowMinimum) {
        output.valueBelowMinimum = value;
      }

      value = parameter.minimumValue;
    } else if (value > parameter.maximumValue) {
      if (value > output.valueExceededMaximum) {
        output.valueExceededMaximum = value;
      }

      value = parameter.maximumValue;
    }

    const weight = output.weight / CubismPhysics.maximumWeight;

    if (weight >= 1.0) {
      parameter.value = value;
    } else {
      value = parameter.value * (1.0 - weight) + value * weight;
      parameter.value = value;
    }
  }

  private updateParticles(
    strand: CubismPhysicsParticle[],
    totalTranslation: math.Vec2,
    totalAngle: number,
    wind: math.Vec2,
    thresholdValue: number,
    deltaTime: number
  ) {
    strand[0] = strand[0].copyWith({ position: totalTranslation });

    const totalRadian = CubismPhysicsMath.degreesToRadian(totalAngle);
    const currentGravity = CubismPhysicsMath.radianToDirection(totalRadian);
    currentGravity.normalize();

    for (let i = 1; i < strand.length; i++) {
      const acceleration = strand[i].acceleration;
      strand[i] = strand[i].copyWith({
        force: Vec2.add(Vec2.multiplySingle(currentGravity, acceleration), wind),
        lastPosition: strand[i].position,
      });

      // The Cubism Editor expects 30 FPS so we scale here by 30...
      const delay = strand[i].delay * deltaTime * 30.0;

      const direction = (() => {
        const tmp = Vec2.subtract(strand[i].position, strand[i - 1].position);
        const radian =
          CubismPhysicsMath.directionToRadian(strand[i].lastGravity, currentGravity) /
          CubismPhysics.airResistance;

        const x = Math.cos(radian) * tmp.x - tmp.y * Math.sin(radian);
        const y = Math.sin(radian) * x + tmp.y * Math.cos(radian);
        return new math.Vec2(x, y);
      })();

      strand[i] = strand[i].copyWith({ position: Vec2.add(strand[i - 1].position, direction) });

      const velocity = Vec2.multiplySingle(strand[i].velocity, delay);
      const force = Vec2.multiplySingle(strand[i].force, delay * delay);

      strand[i] = strand[i].copyWith({
        position: Vec2.add(Vec2.add(strand[i].position, velocity), force),
      });

      const newDirection = Vec2.subtract(strand[i].position, strand[i - 1].position).normalize();

      strand[i] = strand[i].copyWith({
        position: Vec2.add(
          strand[i - 1].position,
          Vec2.multiplySingle(newDirection, strand[i].radius)
        ),
      });

      if (Math.abs(strand[i].position.x) < thresholdValue) {
        strand[i].position.x = 0.0;
      }

      if (delay != 0.0) {
        strand[i] = strand[i].copyWith({
          velocity: Vec2.multiplySingle(
            Vec2.divideSingle(Vec2.subtract(strand[i].position, strand[i].lastPosition), delay),
            strand[i].mobility
          ),
        });
      }

      strand[i] = strand[i].copyWith({ force: math.Vec2.ZERO, lastGravity: currentGravity });
    }
  }

  public initialize() {
    const strand = this.particles;

    // Initialize the top of particle.
    strand[0] = strand[0].copyWith({
      initialPosition: math.Vec2.ZERO.clone(),
      lastPosition: math.Vec2.ZERO.clone(),
    });
    if (this.rig != null) {
      strand[0] = strand[0].copyWith({ lastGravity: this.rig.gravity });
    }

    const lastGravity = strand[0].lastGravity;
    strand[0].copyWith({ lastGravity: new math.Vec2(lastGravity.x, lastGravity.y * -1.0) });

    // Initialize particles.
    for (let i = 1; i < strand.length; i++) {
      const radius = new math.Vec2(0, strand[i].radius);
      const initialPosition = Vec2.add(strand[i - 1].initialPosition, radius);
      const position = initialPosition.clone();
      const lastPosition = initialPosition.clone();
      let lastGravity = this.rig != null ? this.rig.gravity : strand[i].lastGravity;
      lastGravity = new math.Vec2(lastGravity.x, lastGravity.y * -1.0);

      strand[i] = strand[i].copyWith({
        initialPosition: initialPosition,
        position: position,
        lastPosition: lastPosition,
        lastGravity: lastGravity,
      });
    }

    // Initialize inputs.
    for (let i = 0; i < this.input.length; i++) {
      this.input[i].initializeGetter();
    }

    // Initialize outputs.
    for (let i = 0; i < this.output.length; i++) {
      this.output[i].initializeGetter();
    }
  }

  public evaluate(deltaTime: number) {
    let totalAngle = 0.0;
    let totalTranslation = math.Vec2.ZERO.clone();

    const parameters = this.rig?.controller?.parameters ?? null;
    if (parameters == null) {
      if (!EDITOR) {
        console.error(`parameters is null.`);
      }
      return;
    }
    if (this.normalization == null) {
      if (!EDITOR) {
        console.error(`normalization is null.`);
      }
      return;
    }

    for (let i = 0; i < this.input.length; i++) {
      const input = this.input[i];
      const weight = input.weight / CubismPhysics.maximumWeight;

      if (input.getNormalizedParameterValue == null) {
        continue;
      }

      input.source ??= ArrayExtensionMethods.findByIdFromParameters(
        parameters,
        input.sourceId ?? ''
      );

      const parameter = input.source;
      if (parameter == null) {
        continue;
      }

      const funcResult = input.getNormalizedParameterValue(
        totalTranslation,
        totalAngle,
        parameter,
        parameter.value,
        this.normalization,
        weight
      );
      parameter.value = funcResult.parameterValue;
      totalTranslation = funcResult.translation;
      totalAngle = funcResult.angle;
    }

    const radAngle = CubismPhysicsMath.degreesToRadian(-totalAngle);

    totalTranslation = new math.Vec2(
      totalTranslation.x * Math.cos(radAngle) - totalTranslation.y * Math.sin(radAngle),
      totalTranslation.x * Math.sin(radAngle) + totalTranslation.y * Math.cos(radAngle)
    );

    if (this.rig != null && this.normalization != null) {
      this.updateParticles(
        this.particles,
        totalTranslation,
        totalAngle,
        this.rig.wind,
        CubismPhysics.movementThreshold * this.normalization.position.maximum,
        deltaTime
      );
    }

    for (let i = 0; i < this.output.length; ++i) {
      const particleIndex = this.output[i].particleIndex;

      if (particleIndex < 1 || particleIndex >= this.particles.length) {
        break;
      }

      this.output[i].destination ??= ArrayExtensionMethods.findByIdFromParameters(
        parameters,
        this.output[i].destinationId ?? ''
      );

      const parameter = this.output[i].destination;

      const translation = Vec2.subtract(
        this.particles[particleIndex].position,
        this.particles[particleIndex - 1].position
      );

      const func = this.output[i].getValue;

      if (func != null && parameter != null && this.rig != null) {
        const outputValue = func(
          translation,
          parameter,
          this.particles,
          particleIndex,
          this.rig.gravity
        );
        this.updateOutputParameterValue(parameter, outputValue, this.output[i]);
      }
    }
  }
}
