/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

import { AudioPCMDataView, AudioSource, CCFloat, Component, Enum, math, _decorator } from 'cc';
import { MathExtensions } from '../../Utils';
import CubismAudioSamplingQuality from './CubismAudioSamplingQuality';
import CubismMouthController from './CubismMouthController';
const { ccclass, property, requireComponent } = _decorator;

@ccclass('CubismAudioMouthInput')
@requireComponent(CubismMouthController)
export default class CubismAudioMouthInput extends Component {
  @property(AudioSource)
  public audioInput: AudioSource | null = null;

  @property({ type: Enum(CubismAudioSamplingQuality) })
  public samplingQuality: CubismAudioSamplingQuality = CubismAudioSamplingQuality.high;

  @property({ type: CCFloat, slide: true, range: [1.0, 10.0, 0.01] })
  public gain: number = 1.0;

  @property({ type: CCFloat, slide: true, range: [0.0, 1.0, 0.01] })
  public smoothing: number = 0.0;

  private _samples: AudioPCMDataView | null = null;
  private get samples(): AudioPCMDataView | null {
    return this._samples;
  }
  private set samples(value: AudioPCMDataView | null) {
    this._samples = value;
  }

  private _lastRms: number = 0.0;
  private get lastRms() {
    return this._lastRms;
  }
  private set lastRms(value: number) {
    this._lastRms = value;
  }

  private velocityBuffer: number = 0.0;

  private _target: CubismMouthController | null = null;
  private get target() {
    return this._target;
  }
  private set target(value: CubismMouthController | null) {
    this._target = value;
  }

  private isInitializing = false;
  private get isInitialized(): boolean {
    return this.samples != null;
  }

  private sampleRate: number = 0;

  private tryInitialize() {
    // Return early if already initialized.
    if (this.isInitializing || this.isInitialized) {
      return;
    }

    // Initialize samples data.
    this.initSamples();

    // Cache target.
    this.target = this.getComponent(CubismMouthController);
  }

  private async initSamples() {
    if (this.audioInput == null) {
      return;
    }
    this.isInitializing = true;
    const sampleRatePromise = this.audioInput.getSampleRate();
    const pcmPromise = this.audioInput.getPCMData(0);
    const { 0: sampleRate, 1: pcm } = await Promise.all([sampleRatePromise, pcmPromise]);
    if (pcm != null) {
      this.samples = pcm;
      this.sampleRate = sampleRate > 0 ? sampleRate : 0;
    }
    this.isInitializing = false;
  }

  protected update(deltaTime: number) {
    const { audioInput, samples, target, sampleRate, gain, smoothing } = this;

    // 'Fail' silently.
    if (audioInput == null || target == null || samples == null || sampleRate == 0) {
      return;
    }
    const { trunc, sqrt } = Math;

    const { currentTime } = audioInput;
    const pos = trunc(currentTime * this.sampleRate);
    let length = 256;
    switch (this.samplingQuality) {
      case CubismAudioSamplingQuality.veryHigh:
        length = 256;
        break;
      case CubismAudioSamplingQuality.maximum:
        length = 512;
        break;
      default:
        length = 256;
        break;
    }

    // Sample audio.
    let total = 0.0;

    for (let i = 0; i < length; i++) {
      const sample = samples.getData((pos + i) % samples.length);
      total += sample * sample;
    }

    // Compute root mean square over samples.
    let rms = sqrt(total / length) * gain;

    // Clamp root mean square.
    rms = math.clamp01(rms);

    // Smooth rms.
    const output = MathExtensions.Float.smoothDamp(
      this.lastRms,
      rms,
      this.velocityBuffer,
      smoothing * 0.1,
      undefined,
      deltaTime
    );

    rms = output[0];
    this.velocityBuffer = output[1];

    // Set rms as mouth opening and store it for next evaluation.
    target.mouthOpening = rms;

    this.lastRms = rms;
  }

  protected onEnable() {
    this.tryInitialize();
  }
}
