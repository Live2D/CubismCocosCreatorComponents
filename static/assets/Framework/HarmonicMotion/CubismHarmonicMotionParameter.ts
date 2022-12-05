/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

import { _decorator, Component, Enum, CCInteger, CCFloat, game, math } from 'cc';
import CubismHarmonicMotionDirection from './CubismHarmonicMotionDirection';
import CubismParameter from '../../Core/CubismParameter';
const { ccclass, property } = _decorator;

/**
 * Holds data for controlling the output of simple harmonic motions.
 *
 * This type of motion can be very useful for faking breathing, for example.
 *
 * **Sealed class**
 */
@ccclass('CubismHarmonicMotionParameter')
export default class CubismHarmonicMotionParameter extends Component {
  /** Timescale channel. */
  @property({ type: CCInteger, serializable: true, visible: true })
  public channel: number = 0;

  /** Motion direction. */
  @property({ type: Enum(CubismHarmonicMotionDirection), serializable: true, visible: true })
  public direction: CubismHarmonicMotionDirection = CubismHarmonicMotionDirection.Left;

  /**
   * Normalized origin of motion.
   *
   * The actual origin used for evaluating the motion depends limits of the {@link CubismParameter}.
   */
  @property({
    type: CCFloat,
    slide: true,
    range: [0.0, 1.0, 0.01],
    serializable: true,
    visible: true,
  })
  public normalizedOrigin: number = 0.5;

  /**
   * Normalized range of motion.
   *
   * The actual origin used for evaluating the motion depends limits of the {@link CubismParameter}.
   */
  @property({
    type: CCFloat,
    slide: true,
    range: [0.0, 1.0, 0.01],
    serializable: true,
    visible: true,
  })
  public normalizedRange: number = 0.5;

  /** Duration of one motion cycle in seconds. */
  @property({
    type: CCFloat,
    slide: true,
    range: [0.01, 10.0, 0.01],
    serializable: true,
    visible: true,
  })
  public duration: number = 3.0;

  /** true if this is initialized. */
  private get isInitialized(): boolean {
    return Math.abs(this.valueRange) >= math.EPSILON;
  }

  /** Initializes instance. */
  private initialize() {
    // Initialize value fields.
    const parameter = this.getComponent(CubismParameter);

    if (parameter === null) {
      return;
    }

    this.maximumValue = parameter.maximumValue;
    this.minimumValue = parameter.minimumValue;
    this.valueRange = this.maximumValue - this.minimumValue;
  }

  //#region Interface for Controller

  private _maximumValue: number = 0;
  /** Cached {@link CubismParameter.maximumValue}. */
  private get maximumValue() {
    return this._maximumValue;
  }
  private set maximumValue(value: number) {
    this._maximumValue = value;
  }

  private _minimumValue: number = 0;
  /** Cached {@link CubismParameter.minimumValue}. */
  private get minimumValue() {
    return this._minimumValue;
  }
  private set minimumValue(value: number) {
    this._minimumValue = value;
  }

  private _valueRange: number = 0;
  /** Range of {@link maximumValue} and {@link minimumValue}. */
  private get valueRange() {
    return this._valueRange;
  }
  private set valueRange(value: number) {
    this._valueRange = value;
  }

  private _t: number = 0;
  /** Current time. */
  private get t() {
    return this._t;
  }
  private set t(value: number) {
    this._t = value;
  }

  /** Proceeds time. */
  public play(channelTimescales: number[]) {
    this.t += game.deltaTime * channelTimescales[this.channel];

    // Make sure time stays within duration.
    while (this.t > this.duration) {
      this.t -= this.duration;
    }
  }

  /** Evaluates the parameter. */
  public evaluate(): number {
    // Lazily initialize.
    if (!this.isInitialized) {
      this.initialize();
    }

    // Restore origin and range.
    let origin = this.minimumValue + this.normalizedOrigin * this.valueRange;
    let range = this.normalizedRange * this.valueRange;

    // Clamp the range so that it stays within the limits.
    const outputArray = this.clamp(origin, range);

    const originIndex = 0;
    const rangeIndex = 1;
    origin = outputArray[originIndex];
    range = outputArray[rangeIndex];

    // Return result.
    return origin + range * Math.sin((this.t * (2 * Math.PI)) / this.duration);
  }

  //#endregion

  //#region Helper Methods

  /**
   * Clamp origin and range based on {@link direction}.
   * @param origin Origin to clamp.
   * @param range Range to clamp.
   * @returns
   */
  private clamp(origin: number, range: number): [number, number] {
    switch (this.direction) {
      case CubismHarmonicMotionDirection.Left: {
        if (origin - range >= this.minimumValue) {
          range /= 2;
          origin -= range;
        } else {
          range = (origin - this.minimumValue) / 2.0;
          origin = this.minimumValue + range;
          this.normalizedRange = (range * 2.0) / this.valueRange;
        }
        break;
      }
      case CubismHarmonicMotionDirection.Right: {
        if (origin + range <= this.maximumValue) {
          range /= 2.0;
          origin += range;
        } else {
          range = (this.maximumValue - origin) / 2.0;
          origin = this.maximumValue - range;
          this.normalizedRange = (range * 2.0) / this.valueRange;
        }
        break;
      }
      case CubismHarmonicMotionDirection.Centric:
        break;
      default: {
        // Nothing to do.
        const neverCheck: never = this.direction;
        break;
      }
    }

    // Clamp both range and NormalizedRange.
    if (origin - range < this.minimumValue) {
      range = origin - this.minimumValue;
      this.normalizedRange = range / this.valueRange;
    } else if (origin + range > this.maximumValue) {
      range = this.maximumValue - origin;
      this.normalizedRange = range / this.valueRange;
    }

    return [origin, range];
  }
}
