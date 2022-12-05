/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

import { _decorator, animation, game, RealCurve, Component, math } from 'cc';
import ComponentExtensionMethods from '../../Core/ComponentExtensionMethods';
import CubismParameterStore from '../CubismParameterStore';
import CubismUpdateController from '../CubismUpdateController';
import CubismUpdateExecutionOrder from '../CubismUpdateExecutionOrder';
import ICubismUpdatable from '../ICubismUpdatable';
import CubismFadeMath from './CubismFadeMath';
import CubismFadeMotionList from './CubismFadeMotionList';
import type CubismFadeStateObserver from './CubismFadeStateObserver';
import type ICubismFadeState from './ICubismFadeState';
import type CubismParameter from '../../Core/CubismParameter';
import type CubismPart from '../../Core/CubismPart';
const { ccclass, property } = _decorator;

@ccclass('CubismFadeController')
export default class CubismFadeController extends Component implements ICubismUpdatable {
  @property(CubismFadeMotionList)
  public cubismFadeMotionList: CubismFadeMotionList | null = null;

  private _destinationParameters: CubismParameter[] | null = null;
  private get destinationParameters() {
    return this._destinationParameters;
  }
  private set destinationParameters(value: CubismParameter[] | null) {
    this._destinationParameters = value;
  }

  private _destinationParts: CubismPart[] | null = null;
  private get destinationParts() {
    return this._destinationParts;
  }
  private set destinationParts(value: CubismPart[] | null) {
    this._destinationParts = value;
  }

  private _motionController: /*CubismMotionController | */ null = null; //[TODO]

  @property({ serializable: false, visible: false })
  private _hasUpdateController: boolean = false;
  public get hasUpdateController() {
    return this._hasUpdateController;
  }
  public set hasUpdateController(value: boolean) {
    this._hasUpdateController = value;
  }
  private _fadeStates: ICubismFadeState[] | null = null;

  private _animator: animation.AnimationController | null = null;

  private _parameterStore: CubismParameterStore | null = null;

  private _isFading: boolean[] | null = null;

  public refresh() {
    this._animator = this.getComponent(animation.AnimationController);
    // Fail silently...
    if (this._animator == null) {
      return;
    }
    this.destinationParameters =
      ComponentExtensionMethods.findCubismModel(this)?.parameters ?? null;
    this.destinationParts = ComponentExtensionMethods.findCubismModel(this)?.parts ?? null;
    // this._motionController = this.getComponent(CubismMotionController);[TODO]
    this._parameterStore = this.getComponent(CubismParameterStore);
    // Get cubism update controller.
    this.hasUpdateController = this.getComponent(CubismUpdateController) != null;
    // this._fadeStates = this._animator.GetBehaviours(CubismFadeStateObserver) as ICubismFadeState[];[TODO]
    if (
      (this._fadeStates == null || this._fadeStates.length == 0) &&
      this._motionController != null
    ) {
      // this._fadeStates = this._motionController.GetFadeStates();[TODO]
    }
    if (this._fadeStates == null) {
      return;
    }
    this._isFading = new Array<boolean>(this._fadeStates.length);
  }

  public get executionOrder(): number {
    return CubismUpdateExecutionOrder.CUBISM_FADE_CONTROLLER;
  }

  public get needsUpdateOnEditing(): boolean {
    return false;
  }

  protected onLateUpdate(deltaTime: number) {
    // Fail silently.
    if (
      !this.enabled ||
      this._fadeStates == null ||
      this._parameterStore == null ||
      this.destinationParameters == null ||
      this.destinationParts == null ||
      this._isFading == null /*To Cocos*/
    ) {
      return;
    }
    const time = game.totalTime;
    for (let i = 0; i < this._fadeStates.length; ++i) {
      this._isFading[i] = false;
      const playingMotions = this._fadeStates[i].getPlayingMotions();
      if (playingMotions == null || playingMotions.length <= 1) {
        continue;
      }
      const latestPlayingMotion = playingMotions[playingMotions.length - 1];
      const playingMotionData = latestPlayingMotion.motion;
      const elapsedTime = time - latestPlayingMotion.startTime;
      if (playingMotionData?.parameterFadeInTimes != null) {
        for (let j = 0; j < playingMotionData.parameterFadeInTimes.length; j++) {
          if (
            elapsedTime <= playingMotionData.fadeInTime ||
            (0 <= playingMotionData.parameterFadeInTimes[j] &&
              elapsedTime <= playingMotionData.parameterFadeInTimes[j])
          ) {
            this._isFading[i] = true;
            break;
          }
        }
      }
    }
    let isFadingAllFinished = true;
    for (let i = 0; i < this._fadeStates.length; ++i) {
      const playingMotions = this._fadeStates[i].getPlayingMotions();
      if (playingMotions == null) {
        continue;
      }
      const playingMotionCount = playingMotions.length - 1;
      if (this._isFading[i]) {
        isFadingAllFinished = false;
        continue;
      }
      for (let j = playingMotionCount; j >= 0; --j) {
        if (playingMotions.length <= 1) {
          break;
        }
        const playingMotion = playingMotions[j];
        if (time <= playingMotion.endTime) {
          continue;
        }
        // If fade-in has been completed, delete the motion that has been played back.
        this._fadeStates[i].stopAnimation(j);
      }
    }
    if (isFadingAllFinished) {
      return;
    }
    this._parameterStore.restoreParameters();
    // Update sources and destinations.
    for (let i = 0; i < this._fadeStates.length; ++i) {
      if (!this._isFading[i]) {
        continue;
      }
      this.updateFade(this._fadeStates[i]);
    }
  }

  /** ICubismUpdatable Binded callback function. */
  public readonly bindedOnLateUpdate: ICubismUpdatable.CallbackFunction =
    this.onLateUpdate.bind(this);

  /** ICubismUpdatable metadata */
  public readonly [ICubismUpdatable.SYMBOL]: typeof ICubismUpdatable.SYMBOL =
    ICubismUpdatable.SYMBOL;

  private updateFade(fadeState: ICubismFadeState) {
    const playingMotions = fadeState.getPlayingMotions();
    if (
      playingMotions == null ||
      this.destinationParameters == null /*To Cocos*/ ||
      this.destinationParts == null /*To Cocos*/
    ) {
      // Do not process if there is only one motion, if it does not switch.
      return;
    }
    // Weight set for the layer being processed.
    // (In the case of the layer located at the top, it is forced to 1.)
    const layerWeight = fadeState.getLayerWeight();
    const time = game.totalTime;
    // Set playing motions end time.
    if (
      playingMotions.length > 0 &&
      playingMotions[playingMotions.length - 1].motion != null &&
      playingMotions[playingMotions.length - 1].isLooping
    ) {
      const motion = playingMotions[playingMotions.length - 1];
      if (motion.motion != null) {
        const newEndTime = time + motion.motion.fadeOutTime;
        motion.endTime = newEndTime;
        while (true) {
          if (motion.startTime + motion.motion.motionLength >= time) {
            break;
          }
          motion.startTime += motion.motion.motionLength;
        }
        playingMotions[playingMotions.length - 1] = motion;
      }
    }
    // Calculate MotionFade.
    for (let i = 0; i < playingMotions.length; i++) {
      const playingMotion = playingMotions[i];
      const fadeMotion = playingMotion.motion;
      if (
        fadeMotion == null ||
        fadeMotion.parameterIds == null ||
        fadeMotion.parameterCurves == null ||
        fadeMotion.parameterFadeInTimes == null ||
        fadeMotion.parameterFadeOutTimes == null
      ) {
        continue;
      }
      const elapsedTime = time - playingMotion.startTime;
      const endTime = playingMotion.endTime - elapsedTime;
      const fadeInTime = fadeMotion.fadeInTime;
      const fadeOutTime = fadeMotion.fadeOutTime;
      const fadeInWeight =
        fadeInTime <= 0.0 ? 1.0 : CubismFadeMath.getEasingSine(elapsedTime / fadeInTime);
      const fadeOutWeight =
        fadeOutTime <= 0.0
          ? 1.0
          : CubismFadeMath.getEasingSine((playingMotion.endTime - game.totalTime) / fadeOutTime);
      playingMotions[i] = playingMotion;
      const motionWeight =
        i == 0 ? fadeInWeight * fadeOutWeight : fadeInWeight * fadeOutWeight * layerWeight;
      // Apply to parameter values
      for (let j = 0; j < this.destinationParameters.length; ++j) {
        let index = -1;
        for (let k = 0; k < fadeMotion.parameterIds.length; ++k) {
          if (fadeMotion.parameterIds[k] != this.destinationParameters[j].id) {
            continue;
          }
          index = k;
          break;
        }
        if (index < 0) {
          // There is not target ID curve in motion.
          continue;
        }
        this.destinationParameters[j].value = this.evaluate(
          fadeMotion.parameterCurves[index],
          elapsedTime,
          endTime,
          fadeInWeight,
          fadeOutWeight,
          fadeMotion.parameterFadeInTimes[index],
          fadeMotion.parameterFadeOutTimes[index],
          motionWeight,
          this.destinationParameters[j].value
        );
      }
      // Apply to part opacities
      for (let j = 0; j < this.destinationParts.length; ++j) {
        let index = -1;
        for (let k = 0; k < fadeMotion.parameterIds.length; ++k) {
          if (fadeMotion.parameterIds[k] != this.destinationParts[j].id) {
            continue;
          }
          index = k;
          break;
        }
        if (index < 0) {
          // There is not target ID curve in motion.
          continue;
        }
        this.destinationParts[j].opacity = this.evaluate(
          fadeMotion.parameterCurves[index],
          elapsedTime,
          endTime,
          fadeInWeight,
          fadeOutWeight,
          fadeMotion.parameterFadeInTimes[index],
          fadeMotion.parameterFadeOutTimes[index],
          motionWeight,
          this.destinationParts[j].opacity
        );
      }
    }
  }

  public evaluate(
    curve: RealCurve,
    elapsedTime: number,
    endTime: number,
    fadeInTime: number,
    fadeOutTime: number,
    parameterFadeInTime: number,
    parameterFadeOutTime: number,
    motionWeight: number,
    currentValue: number
  ): number {
    if (curve.keyframes.length <= 0) {
      return currentValue;
    }
    // Motion fade.
    if (parameterFadeInTime < 0.0 && parameterFadeOutTime < 0.0) {
      return currentValue + (curve.evaluate(elapsedTime) - currentValue) * motionWeight;
    }
    // Parameter fade.
    let fadeInWeight, fadeOutWeight: number;
    if (parameterFadeInTime < 0.0) {
      fadeInWeight = fadeInTime;
    } else {
      fadeInWeight =
        parameterFadeInTime < math.EPSILON
          ? 1.0
          : CubismFadeMath.getEasingSine(elapsedTime / parameterFadeInTime);
    }
    if (parameterFadeOutTime < 0.0) {
      fadeOutWeight = fadeOutTime;
    } else {
      fadeOutWeight =
        parameterFadeOutTime < math.EPSILON
          ? 1.0
          : CubismFadeMath.getEasingSine(endTime / parameterFadeOutTime);
    }
    const parameterWeight = fadeInWeight * fadeOutWeight;
    return currentValue + (curve.evaluate(elapsedTime) - currentValue) * parameterWeight;
  }

  onEnable() {
    // Initialize cache.
    this.refresh();
  }

  lateUpdate(deltaTime: number) {
    if (!this.hasUpdateController) {
      this.onLateUpdate(deltaTime);
    }
  }
}
