/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

import { _decorator, Enum, CCFloat, Component } from 'cc';
import CubismParameterBlendMode from '../CubismParameterBlendMode';
import CubismParameter from '../../Core/CubismParameter';
import ICubismUpdatable from '../ICubismUpdatable';
import CubismUpdateExecutionOrder from '../CubismUpdateExecutionOrder';
import CubismHarmonicMotionParameter from './CubismHarmonicMotionParameter';
import CubismUpdateController from '../CubismUpdateController';
import FrameworkComponentExtensionMethods from '../ComponentExtensionMethods';
import CoreComponentExtensionMethods from '../../Core/ComponentExtensionMethods';
import CubismParameterExtensionMethods from '../CubismParameterExtensionMethods';
const { ccclass, property } = _decorator;

/**
 * Controller for {@link CubismHarmonicMotionParameter}s.
 *
 * **Sealed class.**
 */
@ccclass('CubismHarmonicMotionController')
export default class CubismHarmonicMotionController extends Component implements ICubismUpdatable {
  /** Default number of channels. */
  private readonly defaultChannelCount = 1;

  /** Blend mode. */
  @property({ type: Enum(CubismParameterBlendMode), serializable: true, visible: true })
  public blendMode: CubismParameterBlendMode = CubismParameterBlendMode.Additive;

  /** The timescales for each channel. */
  @property({ type: [CCFloat], serializable: true, visible: true })
  public channelTimescales: number[] = [];

  private _sources: CubismHarmonicMotionParameter[] = [];
  /** Sources. */
  private get sources(): CubismHarmonicMotionParameter[] {
    return this._sources;
  }
  private set sources(value: CubismHarmonicMotionParameter[]) {
    this._sources = value;
  }

  private _destinations: Array<CubismParameter | null> = [];
  /** Destinations. */
  private get destinations() {
    return this._destinations;
  }
  private set destinations(value: Array<CubismParameter | null>) {
    this._destinations = value;
  }

  @property({ serializable: true, visible: false })
  private _hasUpdateController: boolean = false;
  /** Model has update controller component. */
  public get hasUpdateController() {
    return this._hasUpdateController;
  }
  public set hasUpdateController(value: boolean) {
    this._hasUpdateController = value;
  }

  /** Refreshes the controller. Call this method after adding and/or removing {@link CubismHarmonicMotionParameter}. */
  public refresh() {
    const model = CoreComponentExtensionMethods.findCubismModel(this);

    if (model == null || model.parameters == null) {
      return;
    }

    // Catch sources and destinations.
    this.sources = FrameworkComponentExtensionMethods.getComponentsMany(
      model.parameters,
      CubismHarmonicMotionParameter
    );
    this.destinations = new Array<CubismParameter>(this.sources.length);

    for (let i = 0; i < this.sources.length; ++i) {
      this.destinations[i] = this.sources[i].getComponent(CubismParameter);
    }

    // Get cubism update controller.
    this.hasUpdateController = this.getComponent(CubismUpdateController) != null;
  }

  /** Called by cubism update controller. Order to invoke OnLateUpdate. */
  public get executionOrder(): number {
    return CubismUpdateExecutionOrder.CUBISM_HARMONIC_MOTION_CONTROLLER;
  }

  /** Called by cubism update controller. Needs to invoke OnLateUpdate on Editing. */
  public get needsUpdateOnEditing(): boolean {
    return false;
  }

  /** Called by cubism update controller. Updates controller. */
  protected onLateUpdate(deltaTime: number) {
    // Return if it is not valid or there's nothing to update.
    if (!this.enabled || this.sources == null) {
      return;
    }

    // Update sources and destinations.
    for (let i = 0; i < this.sources.length; ++i) {
      this.sources[i].play(this.channelTimescales);

      CubismParameterExtensionMethods.blendToValue(
        this.destinations[i],
        this.blendMode,
        this.sources[i].evaluate()
      );
    }
  }

  /** ICubismUpdatable Binded callback function. */
  public readonly bindedOnLateUpdate: ICubismUpdatable.CallbackFunction =
    this.onLateUpdate.bind(this);
  /** ICubismUpdatable metadata */
  public readonly [ICubismUpdatable.SYMBOL]: typeof ICubismUpdatable.SYMBOL =
    ICubismUpdatable.SYMBOL;

  /** Called by Cocos Creator. Makes sure cache is initialized. */
  protected start() {
    // Initialize cache.
    this.refresh();
  }

  /** Called by Cocos Creator. Updates controller. */
  protected lateUpdate(deltaTime: number) {
    if (!this.hasUpdateController) {
      this.onLateUpdate(deltaTime);
    }
  }

  /** Called by Cocos Creator. Resets channels. */
  public resetInEditor() {
    // Reset/Initialize channel timescales.
    this.channelTimescales = new Array(this.defaultChannelCount);

    for (let s = 0; s < this.defaultChannelCount; ++s) {
      this.channelTimescales[s] = 1.0;
    }
  }
}
