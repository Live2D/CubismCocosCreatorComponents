/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

import { Component, Enum, CCFloat, _decorator } from 'cc';
import CubismMouthParameter from './CubismMouthParameter';
import CubismParameterBlendMode from '../CubismParameterBlendMode';
import CubismUpdateController from '../CubismUpdateController';
import CubismUpdateExecutionOrder from '../CubismUpdateExecutionOrder';
import CubismParameter from '../../Core/CubismParameter';
import CoreComponentExtensionMethods from '../../Core/ComponentExtensionMethods';
import CubismParameterExtensionMethods from '../CubismParameterExtensionMethods';
import ComponentExtensionMethods from '../ComponentExtensionMethods';
import ICubismUpdatable from '../ICubismUpdatable';
const { ccclass, property } = _decorator;

@ccclass('CubismMouthController')
export default class CubismMouthController extends Component implements ICubismUpdatable {
  @property({ type: Enum(CubismParameterBlendMode) })
  public blendMode: CubismParameterBlendMode = CubismParameterBlendMode.Multiply;

  @property({ type: CCFloat, slide: true, range: [0.0, 1.0, 0.01] })
  public mouthOpening: number = 1.0;

  private _destinations: Array<CubismParameter | null> = [];
  private get destinations() {
    return this._destinations;
  }
  private set destinations(value: Array<CubismParameter | null>) {
    this._destinations = value;
  }

  @property({ serializable: false, visible: false })
  private _hasUpdateController: boolean = false;
  public get hasUpdateController() {
    return this._hasUpdateController;
  }
  public set hasUpdateController(value: boolean) {
    this._hasUpdateController = value;
  }

  public refresh() {
    const model = CoreComponentExtensionMethods.findCubismModel(this);

    // Fail silently...
    if (model == null || model.parameters == null) {
      return;
    }

    // Cache destinations.
    const tags = ComponentExtensionMethods.getComponentsMany(
      model.parameters,
      CubismMouthParameter
    );

    this.destinations = new Array(tags.length);

    for (let i = 0; i < tags.length; ++i) {
      this.destinations[i] = tags[i].getComponent(CubismParameter);
    }

    // Get cubism update controller.
    this.hasUpdateController = this.getComponent(CubismUpdateController) != null;
  }

  public get executionOrder(): number {
    return CubismUpdateExecutionOrder.CUBISM_MOUTH_CONTROLLER;
  }

  public get needsUpdateOnEditing(): boolean {
    return false;
  }

  protected onLateUpdate(deltaTime: number) {
    // Fail silently.
    if (!this.enabled || this.destinations == null) {
      return;
    }

    // Apply value.
    CubismParameterExtensionMethods.blendToValueArray(
      this.destinations,
      this.blendMode,
      this.mouthOpening
    );
  }
  /** Binded callback function */
  public readonly bindedOnLateUpdate: ICubismUpdatable.CallbackFunction =
    this.onLateUpdate.bind(this);
  /** ICubismUpdatable metadata */
  public readonly [ICubismUpdatable.SYMBOL]: typeof ICubismUpdatable.SYMBOL =
    ICubismUpdatable.SYMBOL;

  protected start() {
    // Initialize cache.
    this.refresh();
  }

  protected lateUpdate(deltaTime: number) {
    if (!this.hasUpdateController) {
      this.onLateUpdate(deltaTime);
    }
  }
}
