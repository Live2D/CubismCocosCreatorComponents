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
import type IStructLike from '../../IStructLike';
import { isImporter, MathExtensions } from '../../Utils';
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

  @property({ serializable: false })
  private _currentRigOutput: SubRigPhysicsOutput = new SubRigPhysicsOutput(); // Results of the latest pendulum calculation.

  @property({ serializable: false })
  private _previousRigOutput: SubRigPhysicsOutput = new SubRigPhysicsOutput(); // Result of previous pendulum calculation.

  /**
   * Applies the specified weights from the latest and one previous result of the pendulum operation.
   * @param weight Weight of latest results.
   */
  public interpolate(weight: number): void {
    //#region Assertion
    const { rig } = this;
    if (rig == null) {
      console.assert(rig != null);
      return;
    }
    const { controller } = rig;
    if (controller == null) {
      console.assert(controller != null);
      return;
    }
    const { parameters } = controller;
    if (parameters == null) {
      console.assert(parameters != null);
      return;
    }
    //#endregion

    // Load input parameters.
    for (let i = 0; i < this.output.length; i++) {
      const output = this.output[i];
      output.destination ??= ArrayExtensionMethods.findByIdFromParameters(
        parameters,
        output.destinationId ?? ''
      );
      if (output.destination == null) {
        continue;
      }
      output.destination.value = this.updateOutputParameterValue(
        output.destination,
        output.destination.value,
        this._previousRigOutput.output[i] * (1 - weight) +
          this._currentRigOutput.output[i] * weight,
        this.output[i]
      );
    }
  }

  /**
   * Updates parameter from output value.
   * @param parameter Target parameter.
   * @param parameterValue Target parameter Value.
   * @param translation Translation.
   * @param output Output value.
   * @returns Changed parameter value.
   */
  private updateOutputParameterValue(
    parameter: CubismParameter,
    parameterValue: number,
    translation: number,
    output: CubismPhysicsOutput
  ): number {
    //#region Assertion
    if (output.getScale == null) {
      console.assert(output.getScale != null);
      return parameterValue;
    }
    //#endregion

    const outputScale = output.getScale();

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
      return value;
    } else {
      return parameterValue * (1.0 - weight) + value * weight;
    }
  }

  /**
   * Updates particles in every frame.
   * @param strand Particles.
   * @param totalTranslation Total translation.
   * @param totalAngle Total angle.
   * @param wind Direction of wind.
   * @param thresholdValue Value of threshold.
   * @param deltaTime Time of delta.
   */
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
      const { acceleration } = strand[i];
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

  /**
   * Updates particles in stabilization function.
   * @param strand Particles
   * @param totalTranslation Total translation.
   * @param totalAngle Total angle.
   * @param wind Direction of wind.
   * @param thresholdValue Value of threshold.
   */
  private updateParticlesForStabilization(
    strand: CubismPhysicsParticle[],
    totalTranslation: math.Vec2,
    totalAngle: number, // float
    wind: math.Vec2,
    thresholdValue: number // float
  ): void {
    strand[0] = strand[0].copyWith({ position: totalTranslation });

    const totalRadian = CubismPhysicsMath.degreesToRadian(totalAngle);
    const currentGravity = CubismPhysicsMath.radianToDirection(totalRadian);
    currentGravity.normalize();

    for (let i = 1; i < strand.length; i++) {
      strand[i] = strand[i].copyWith({
        force: MathExtensions.Vec2.add(
          MathExtensions.Vec2.multiplySingle(currentGravity, strand[i].acceleration),
          wind
        ),
        lastPosition: strand[i].position,
        velocity: math.Vec2.ZERO,
      });

      const force = strand[i].force;
      force.normalize();

      strand[i] = strand[i].copyWith({
        position: MathExtensions.Vec2.add(
          strand[i - 1].position,
          MathExtensions.Vec2.multiplySingle(force, strand[i].radius)
        ),
      });

      if (Math.abs(strand[i].position.x) < thresholdValue) {
        strand[i] = strand[i].copyWith({ position: new math.Vec2(0.0, strand[i].position.y) });
      }

      strand[i] = strand[i].copyWith({ force: math.Vec2.ZERO, lastGravity: currentGravity });
    }
  }

  /** Initializes this. */
  public initialize(): void {
    const strand = this.particles;

    // Initialize the top of particle.
    const gravity = this.rig?.gravity;
    if (gravity == null) {
      console.assert(gravity != null);
      return;
    }

    strand[0] = strand[0].copyWith({
      initialPosition: math.Vec2.ZERO.clone(),
      lastPosition: math.Vec2.ZERO.clone(),
      lastGravity: new math.Vec2(gravity.x, gravity.y * -1.0),
    });

    // Initialize particles.
    for (let i = 1; i < strand.length; i++) {
      const gravity = this.rig?.gravity;
      if (gravity == null) {
        console.assert(gravity != null);
        return;
      }

      const radius = new math.Vec2(0, strand[i].radius);
      const initialPosition = Vec2.add(strand[i - 1].initialPosition, radius);
      const position = initialPosition.clone();
      const lastPosition = initialPosition.clone();

      strand[i] = strand[i].copyWith({
        initialPosition: initialPosition,
        position: position,
        lastPosition: lastPosition,
        lastGravity: new math.Vec2(gravity.x, gravity.y * -1.0),
      });
    }

    // Initialize inputs.
    for (let i = 0; i < this.input.length; i++) {
      this.input[i].initializeGetter();
    }

    this._previousRigOutput = new SubRigPhysicsOutput();
    this._currentRigOutput = new SubRigPhysicsOutput();

    // Initialize outputs.
    for (let i = 0; i < this.output.length; i++) {
      this.output[i].initializeGetter();
    }
  }

  /**
   * Evaluate rig in every frame.
   * @param deltaTime
   */
  public evaluate(deltaTime: number): void {
    if (EDITOR && isImporter()) {
      // Importer から呼び出されても処理を行いません。
      return;
    }

    let totalAngle = 0.0;
    let totalTranslation = math.Vec2.ZERO.clone();

    const { rig, normalization, particles, _currentRigOutput, _previousRigOutput } = this;
    if (rig == null || normalization == null) {
      console.assert(rig != null);
      console.assert(normalization != null);
      return;
    }
    const { controller } = rig;
    if (controller == null) {
      console.assert(controller != null);
      return;
    }

    const { parameters } = controller;
    if (parameters == null) {
      console.assert(parameters != null);
      return;
    }

    for (let i = 0; i < this.input.length; i++) {
      const input = this.input[i];
      const weight = input.weight / CubismPhysics.maximumWeight;

      if (input.getNormalizedParameterValue == null) {
        console.assert(input.getNormalizedParameterValue != null);
        continue;
      }

      input.source ??= ArrayExtensionMethods.findByIdFromParameters(
        parameters,
        input.sourceId ?? ''
      );

      const parameter = input.source;
      if (parameter == null) {
        console.assert(parameter != null);
        continue;
      }
      let index = parameters.indexOf(parameter);
      const funcResult = input.getNormalizedParameterValue(
        totalTranslation,
        totalAngle,
        parameter,
        rig.parametersCache[index],
        normalization,
        weight
      );
      rig.parametersCache[index] = funcResult.parameterValue;
      totalTranslation = funcResult.translation;
      totalAngle = funcResult.angle;
    }

    const radAngle = CubismPhysicsMath.degreesToRadian(-totalAngle);

    {
      const x = totalTranslation.x * Math.cos(radAngle) - totalTranslation.y * Math.sin(radAngle);
      const y = x * Math.sin(radAngle) + totalTranslation.y * Math.cos(radAngle);
      totalTranslation = new math.Vec2(x, y);
    }

    this.updateParticles(
      particles,
      totalTranslation,
      totalAngle,
      rig.wind,
      CubismPhysics.movementThreshold * normalization.position.maximum,
      deltaTime
    );

    for (let i = 0; i < this.output.length; i++) {
      const output = this.output[i];
      const particleIndex = output.particleIndex;

      if (particleIndex < 1 || particleIndex >= particles.length) {
        break;
      }

      output.destination ??= ArrayExtensionMethods.findByIdFromParameters(
        parameters,
        output.destinationId ?? ''
      );
      const { destination } = output;
      if (destination == null) {
        console.assert(destination != null);
        continue;
      }

      const index = parameters.indexOf(destination);

      const translation = Vec2.subtract(
        particles[particleIndex].position,
        particles[particleIndex - 1].position
      );

      const parameter = destination;

      if (output.getValue == null) {
        console.assert(output.getValue != null);
        return;
      }

      const outputValue = output.getValue(translation, particles, particleIndex, rig.gravity);

      _currentRigOutput.output[i] = outputValue;
      _previousRigOutput.output[i] = outputValue;

      destination.value = this.updateOutputParameterValue(
        parameter,
        destination.value,
        outputValue,
        output
      );

      rig.parametersCache[index] = parameter.value;
    }
  }

  /** Calculate the state in which the physics operation stabilizes at the current parameter values. */
  public stabilization(): void {
    //#region Assertion
    const { rig, normalization, particles, _previousRigOutput, _currentRigOutput } = this;
    if (rig == null || normalization == null) {
      console.assert(rig != null);
      console.assert(normalization != null);
      return;
    }
    const { controller } = rig;
    if (controller == null) {
      console.assert(controller != null);
      return;
    }
    const { parameters } = controller;
    if (parameters == null) {
      console.assert(parameters != null);
      return;
    }
    //#endregion

    let totalAngle = 0.0;
    let totalTranslation = math.Vec2.ZERO;

    for (let i = 0; i < this.input.length; i++) {
      const input = this.input[i];

      if (input.getNormalizedParameterValue == null) {
        console.assert(input.getNormalizedParameterValue != null);
        continue;
      }

      const weight = input.weight / CubismPhysics.maximumWeight;

      input.source ??= ArrayExtensionMethods.findByIdFromParameters(
        parameters,
        input.sourceId ?? ''
      );

      const { source } = input;
      if (source == null) {
        console.assert(source != null);
        continue;
      }

      const index = parameters.findIndex((value, _i, _a) => value === this.input[i].source);

      const parameter = source;
      const result = input.getNormalizedParameterValue(
        totalTranslation,
        totalAngle,
        parameter,
        source.value,
        normalization,
        weight
      );
      totalTranslation = result.translation;
      totalAngle = result.angle;
      source.value = result.parameterValue;

      rig.parametersCache[index] = source.value;
    }

    const radAngle = CubismPhysicsMath.degreesToRadian(-totalAngle);

    {
      const x = totalTranslation.x * Math.cos(radAngle) - totalTranslation.y * Math.sin(radAngle);
      const y = x * Math.sin(radAngle) + totalTranslation.y * Math.cos(radAngle);
      totalTranslation = new math.Vec2(x, y);
    }

    this.updateParticlesForStabilization(
      particles,
      totalTranslation,
      totalAngle,
      rig.wind,
      CubismPhysics.movementThreshold * normalization.position.maximum
    );

    for (let i = 0; i < this.output.length; i++) {
      const output = this.output[i];
      if (output.getValue == null) {
        console.assert(output.getValue != null);
        continue;
      }

      _previousRigOutput.output[i] = _currentRigOutput.output[i];

      output.destination ??= ArrayExtensionMethods.findByIdFromParameters(
        parameters,
        output.destinationId ?? ''
      );
      if (output.destination == null) {
        continue;
      }

      const { particleIndex } = output;
      if (particleIndex < 1 || particleIndex >= this.particles.length) {
        continue;
      }

      const index = parameters.indexOf(output.destination);

      const translation = MathExtensions.Vec2.subtract(
        particles[particleIndex].position,
        particles[particleIndex - 1].position
      );

      const parameter = output.destination;
      const outputValue = output.getValue(translation, particles, particleIndex, rig.gravity);

      _currentRigOutput.output[i] = outputValue;
      _previousRigOutput.output[i] = outputValue;
      output.destination.value = this.updateOutputParameterValue(
        parameter,
        output.destination.value,
        outputValue,
        this.output[i]
      );

      rig.parametersCache[index] = output.destination.value;
    }
  }
}

class SubRigPhysicsOutput implements IStructLike<SubRigPhysicsOutput> {
  public readonly output: number[] = new Array(0);

  public constructor(args: { output?: number[] } = {}) {
    this.output = args.output ?? new Array<number>(0);
  }

  public copyWith(args: { output?: number[] } = {}): SubRigPhysicsOutput {
    return new SubRigPhysicsOutput({ output: args.output ?? this.output });
  }

  public equals(other: SubRigPhysicsOutput): boolean {
    return this === other || this.output == other.output;
  }

  strictEquals(other: SubRigPhysicsOutput): boolean {
    return this === other;
  }
}
