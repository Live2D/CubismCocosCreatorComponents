/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

import { CCFloat, math, _decorator } from 'cc';
import ComponentExtensionMethods from '../../Core/ComponentExtensionMethods';
import CubismPhysics from './CubismPhysics';
import CubismPhysicsController from './CubismPhysicsController';
import CubismPhysicsSubRig from './CubismPhysicsSubRig';
const { property, ccclass } = _decorator;

/** Physics rig. */
@ccclass('CubismPhysicsRig')
export default class CubismPhysicsRig {
  /** Children of rig. */
  @property({ type: [CubismPhysicsSubRig], serializable: true })
  subRigs: Array<CubismPhysicsSubRig | null> = new Array(0);

  @property({ serializable: true })
  gravity: math.Vec2 = CubismPhysics.gravity.clone();

  @property({ serializable: true })
  wind: math.Vec2 = CubismPhysics.wind.clone();

  @property({ type: CCFloat, serializable: true })
  public fps: number = 0.0;

  @property({ serializable: false })
  private _currentRemainTime: number = 0; // Time not processed by physics.

  @property({ serializable: false })
  private _parametersCache: number[] = new Array(0); // Cache parameters used by Evaluate.

  public get parametersCache(): number[] {
    return this._parametersCache;
  }
  public set parametersCache(value: number[]) {
    this._parametersCache = value;
  }

  @property({ serializable: false })
  private _parametersInputCache: number[] = new Array(0); // Cache input when UpdateParticles runs.

  private _controller: CubismPhysicsController | null = null;
  /** Reference of controller to refer from children rig. */
  public get controller() {
    return this._controller;
  }
  /** Reference of controller to refer from children rig. */
  public set controller(value: CubismPhysicsController | null) {
    this._controller = value;
  }

  /** Initializes rigs. */
  public initialize() {
    for (let i = 0; i < this.subRigs.length; i++) {
      this.subRigs[i]?.initialize();
    }
  }

  /** Calculations are performed until the physics are stable. */
  public stabilization(): void {
    //#region Assertion
    const { controller } = this;
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

    // Initialize.
    if (this._parametersCache == null) {
      this._parametersCache = new Array(parameters.length).fill(0);
    }

    if (this._parametersCache.length < parameters.length) {
      const start = this._parametersCache.length;
      this._parametersCache.length = parameters.length;
      this._parametersCache.fill(0, start);
    }

    if (this._parametersInputCache == null) {
      this._parametersInputCache = new Array(parameters.length).fill(0);
    }

    if (this._parametersInputCache.length < parameters.length) {
      const start = this._parametersInputCache.length;
      this._parametersInputCache.length = parameters.length;
      this._parametersInputCache.fill(0, start);
    }

    // Obtain and cache the current parameter posture.
    for (let i = 0; i < parameters.length; i++) {
      this._parametersCache[i] = parameters[i].value;
      this._parametersInputCache[i] = this._parametersCache[i];
    }

    // Evaluate.
    for (let i = 0; i < this.subRigs.length; i++) {
      const subRig = this.subRigs[i];
      if (subRig == null) {
        console.assert(subRig != null);
        continue;
      }
      subRig.stabilization();
    }

    const model = ComponentExtensionMethods.findCubismModel(controller);
    if (model == null) {
      console.assert(model != null);
      return;
    }
    model.forceUpdateNow();
  }

  /** Evaluate rigs.
   *
   * Pendulum interpolation weights
   *
   * The result of the pendulum calculation is saved and the output to the parameters is interpolated with the saved previous result of the pendulum calculation.
   *
   * The figure shows the interpolation between [1] and [2].
   *
   * The weight of the interpolation are determined by the current time seen between the latest pendulum calculation timing and the next timing.
   *
   * Figure shows the weight of position (3) as seen between [2] and [4].
   *
   * As an interpretation, the pendulum calculation and weights are misaligned.
   *
   * If there is no FPS information in physics3.json, it is always set in the previous pendulum state.
   *
   * The purpose of this specification is to avoid the quivering appearance caused by deviations from the interpolation range.
   *
   * ```
   * ------------ time -------------->
   *    　　　　　　　　|+++++|------| <- weight
   * ==[1]====#=====[2]---(3)----(4)
   *          ^ output contents
   * ```
   *
   * 1. _previousRigOutput
   * 2. _currentRigOutput
   * 3. _currentRemainTime (now rendering)
   * 4. next particles timing
   *
   * @param deltaTime
   */
  public evaluate(deltaTime: number) {
    if (0.0 >= deltaTime) {
      return;
    }
    this._currentRemainTime += deltaTime;
    if (this._currentRemainTime > CubismPhysics.maxDeltaTime) {
      this._currentRemainTime = 0.0;
    }

    let physicsDeltaTime = 0.0;

    if (this.fps > 0.0) {
      physicsDeltaTime = 1.0 / this.fps;
    } else {
      physicsDeltaTime = deltaTime;
    }

    const controller = this.controller;
    if (controller == null) {
      console.assert(controller != null);
      return;
    }
    const { parameters } = controller;
    if (parameters == null) {
      console.assert(parameters != null);
      return;
    }

    if (this._parametersCache == null) {
      this._parametersCache = new Array(parameters.length).fill(0);
    }

    if (this._parametersCache.length < parameters.length) {
      const start = this._parametersCache.length;
      this._parametersCache.length = parameters.length;
      this._parametersCache.fill(0, start);
    }

    if (this._parametersInputCache == null) {
      this._parametersInputCache = new Array(parameters.length).fill(0);
    }

    if (this._parametersInputCache.length < parameters.length) {
      const start = this._parametersInputCache.length;
      this._parametersInputCache.length = parameters.length;
      this._parametersInputCache.fill(0, start);

      for (var i = 0; i < this._parametersInputCache.length; i++) {
        this._parametersInputCache[i] = this._parametersCache[i];
      }
    }

    while (this._currentRemainTime >= physicsDeltaTime) {
      let inputWeight = physicsDeltaTime / this._currentRemainTime;

      // Calculate the input at the timing to UpdateParticles by linear interpolation with the _parameterInputCache and parameterValue.
      // _parameterCache needs to be separated from _parameterInputCache because of its role in propagating values between groups.
      for (let i = 0; i < parameters.length; i++) {
        this._parametersCache[i] =
          this._parametersInputCache[i] * (1.0 - inputWeight) + parameters[i].value * inputWeight;
        this._parametersInputCache[i] = this._parametersCache[i];
      }

      for (let i = 0; i < this.subRigs.length; i++) {
        const subRig = this.subRigs[i];
        if (subRig == null) {
          console.assert(subRig != null);
          continue;
        }
        subRig.evaluate(physicsDeltaTime);
      }

      this._currentRemainTime -= physicsDeltaTime;
    }

    let alpha = this._currentRemainTime / physicsDeltaTime;
    for (let i = 0; i < this.subRigs.length; i++) {
      const subRig = this.subRigs[i];
      if (subRig == null) {
        console.assert(subRig != null);
        continue;
      }
      subRig.interpolate(alpha);
    }
  }
}
