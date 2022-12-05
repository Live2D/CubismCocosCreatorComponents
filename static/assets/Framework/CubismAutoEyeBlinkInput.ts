/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

import { CCFloat, Component, random, _decorator } from 'cc';
import CubismEyeBlinkController from './CubismEyeBlinkController';
const { ccclass, property } = _decorator;

/** Automatic mouth movement. */
@ccclass('CubismAutoEyeBlinkInput')
export default class CubismAutoEyeBlinkInput extends Component {
  /** Mean time between eye blinks in seconds. */
  @property({ type: CCFloat, serializable: true, range: [1.0, 10.0, 0.001] })
  public mean: number = 2.5;

  /** Maximum deviation from {@link mean} in seconds. */
  @property({ type: CCFloat, serializable: true, range: [0.5, 5.0, 0.001] })
  public maximumDeviation: number = 2.0;

  /** Timescale. */
  @property({ type: CCFloat, serializable: true, range: [1.0, 20.0, 0.001] })
  public timescale: number = 10.0;

  /** Target controller. */
  private _controller: CubismEyeBlinkController | null = null;
  private get controller(): CubismEyeBlinkController | null {
    return this._controller;
  }
  private set controller(value: CubismEyeBlinkController | null) {
    this._controller = value;
  }

  /** Time until next eye blink. */
  private _t: number = 0;
  private get t(): number {
    return this._t;
  }
  private set t(value: number) {
    this._t = value;
  }

  /** Control over whether output should be evaluated. */
  private _currentPhase: Phase = Phase.Idling;
  private get currentPhase(): Phase {
    return this._currentPhase;
  }
  private set currentPhase(value: Phase) {
    this._currentPhase = value;
  }

  /** Used for switching from {@link Phase.ClosingEyes} to {@link Phase.OpeningEyes} and back to {@link Phase.Idling. */
  private _lastValue: number = 0;
  private get lastValue(): number {
    return this._lastValue;
  }
  private set lastValue(value: number) {
    this._lastValue = value;
  }

  /** Resets the input. */
  public reset(): void {
    this.t = 0;
  }
  public resetInEditor(): void {
    this.reset();
  }

  //#region Cocos Creator Event Handling

  /** Called by Cocos Creator. Initializes input. */
  protected start(): void {
    this.controller = this.getComponent(CubismEyeBlinkController);
  }

  /**
   * Called by Cocos Creator. Updates controller.
   *
   * Make sure this method is called after any animations are evaluated.
   */
  protected lateUpdate(dt: number): void {
    // Fail silently.
    if (this.controller == null) {
      return;
    }

    // Wait for time until blink.
    if (this.currentPhase == Phase.Idling) {
      this.t -= dt;

      if (this.t < 0) {
        this.t = Math.PI * -0.5;
        this.lastValue = 1;
        this.currentPhase = Phase.ClosingEyes;
      } else {
        return;
      }
    }

    // Evaluate eye blinking.
    this.t += dt * this.timescale;
    let value = Math.abs(Math.sin(this.t));

    if (this.currentPhase == Phase.ClosingEyes && value > this.lastValue) {
      this.currentPhase = Phase.OpeningEyes;
    } else if (this.currentPhase == Phase.OpeningEyes && value < this.lastValue) {
      value = 1;
      this.currentPhase = Phase.Idling;
      const range = this.maximumDeviation * 2;
      this.t = this.mean + random() * range - this.maximumDeviation;
    }

    this.controller.eyeOpening = value;
    this.lastValue = value;
  }

  //#endregion
}

/** Internal states. */
enum Phase {
  /** Idle state. */
  Idling,

  /** State when closing eyes. */
  ClosingEyes,

  /** State when opening eyes. */
  OpeningEyes,
}
