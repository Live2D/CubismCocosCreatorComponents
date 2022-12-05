/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

import { CCFloat, Component, Enum, _decorator } from 'cc';
import ComponentExtensionMethods from './ComponentExtensionMethods';
import CoreComponentExtensionMethods from '../Core/ComponentExtensionMethods';
import CubismEyeBlinkParameter from './CubismEyeBlinkParameter';
import CubismParameterBlendMode from './CubismParameterBlendMode';
import ICubismUpdatable from './ICubismUpdatable';
import CubismParameter from '../Core/CubismParameter';
import CubismUpdateExecutionOrder from './CubismUpdateExecutionOrder';
import CubismUpdateController from './CubismUpdateController';
import CubismParameterExtensionMethods from './CubismParameterExtensionMethods';
const { ccclass, property } = _decorator;

/**
 * {@link CubismEyeBlinkParameter} controller.
 *
 * **Sealed class**
 */
@ccclass('CubismEyeBlinkController')
export default class CubismEyeBlinkController extends Component implements ICubismUpdatable {
  /** Blend mode. */
  @property({ type: Enum(CubismParameterBlendMode), visible: true, serializable: true })
  public blendMode: CubismParameterBlendMode = CubismParameterBlendMode.Multiply;

  /** Opening of the eyes. */
  @property({ type: CCFloat, visible: true, serializable: true, range: [0.0, 1.0, 0.01] })
  public eyeOpening: number = 1.0;

  /** Eye blink parameters cache. */
  private _destinations: (CubismParameter | null)[] | null = null;
  public get destinations(): (CubismParameter | null)[] | null {
    return this._destinations;
  }
  public set destinations(value: (CubismParameter | null)[] | null) {
    this._destinations = value;
  }

  /** Model has update controller component. */
  @property({ visible: false, serializable: false })
  private _hasUpdateController: boolean = false;
  public get hasUpdateController(): boolean {
    return this._hasUpdateController;
  }
  public set hasUpdateController(value: boolean) {
    this._hasUpdateController = value;
  }

  /** Refreshes controller. Call this method after adding and/or removing <see cref="CubismEyeBlinkParameter"/>s. */
  public refresh(): void {
    const model = CoreComponentExtensionMethods.findCubismModel(this);

    // Fail silently...
    if (model == null) {
      return;
    }

    // Cache destinations.
    const tags =
      model.parameters != null
        ? ComponentExtensionMethods.getComponentsMany(model.parameters, CubismEyeBlinkParameter)
        : null;

    this.destinations = new Array(tags?.length ?? 0);

    for (var i = 0; i < this.destinations.length; i++) {
      this.destinations[i] = tags![i].getComponent(CubismParameter);
    }

    // Get cubism update controller.
    this.hasUpdateController = this.getComponent(CubismUpdateController) != null;
  }

  /** Called by cubism update controller. Order to invoke OnLateUpdate. */
  public get executionOrder(): number {
    return CubismUpdateExecutionOrder.CUBISM_EYE_BLINK_CONTROLLER;
  }

  /** Called by cubism update controller. Needs to invoke OnLateUpdate on Editing. */
  public get needsUpdateOnEditing(): boolean {
    return false;
  }

  /** Called by cubism update controller. Updates controller. */
  public onLateUpdate(): void {
    // Fail silently.
    if (!this.enabled || this.destinations == null) {
      return;
    }

    // Apply value.
    CubismParameterExtensionMethods.blendToValueArray(
      this.destinations,
      this.blendMode,
      this.eyeOpening
    );
  }

  //#region Cocos Creator Event Handling

  /** Called by Cocos Creator. Makes sure cache is initialized. */
  protected start(): void {
    // Initialize cache.
    this.refresh();
  }

  /** Called by Cocos Creator. */
  protected lateUpdate(): void {
    if (!this.hasUpdateController) {
      this.onLateUpdate();
    }
  }

  //#endregion

  /** ICubismUpdatable Binded callback function. */
  public readonly bindedOnLateUpdate = this.onLateUpdate.bind(this);
  /** ICubismUpdatable metadata */
  public readonly [ICubismUpdatable.SYMBOL]: typeof ICubismUpdatable.SYMBOL =
    ICubismUpdatable.SYMBOL;
}
