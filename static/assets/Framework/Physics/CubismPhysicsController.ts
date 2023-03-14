/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

import { Component, _decorator } from 'cc';
import CubismUpdateController from '../CubismUpdateController';
import CubismUpdateExecutionOrder from '../CubismUpdateExecutionOrder';
import CubismPhysics from './CubismPhysics';
import CubismPhysicsRig from './CubismPhysicsRig';
import ComponentExtensionMethods from '../../Core/ComponentExtensionMethods';
import ICubismUpdatable from '../ICubismUpdatable';
import type CubismParameter from '../../Core/CubismParameter';
import CubismRenderController from '../../Rendering/CubismRenderController';
import CubismMaskController from '../../Rendering/Masking/CubismMaskController';
const { ccclass, property } = _decorator;

@ccclass('CubismPhysicsController')
export default class CubismPhysicsController extends Component implements ICubismUpdatable {
  private get rig() {
    return this._rig;
  }
  private set rig(value: CubismPhysicsRig | null) {
    this._rig = value;
  }

  @property({ type: CubismPhysicsRig, serializable: true })
  private _rig: CubismPhysicsRig | null = null;

  private _parameters: CubismParameter[] | null = null;
  public get parameters(): CubismParameter[] | null {
    return this._parameters;
  }
  private set parameters(value: CubismParameter[] | null) {
    this._parameters = value;
  }

  @property({ serializable: false, visible: false })
  private _hasUpdateController: boolean = false;
  public get hasUpdateController(): boolean {
    return this._hasUpdateController;
  }
  private set hasUpdateController(value: boolean) {
    this._hasUpdateController = value;
  }

  public get executionOrder(): number {
    return CubismUpdateExecutionOrder.CUBISM_PHYSICS_CONTROLLER;
  }

  public get needsUpdateOnEditing(): boolean {
    return false;
  }

  public onLateUpdate(deltaTime: number) {
    let _deltaTime = deltaTime;

    // Use fixed delta time if required.
    if (CubismPhysics.useFixedDeltaTime) {
      // TODO: 存在しないAPI
      // _deltaTime = Time.fixedDeltaTime;
    }

    // Evaluate rig.
    this.rig?.evaluate(_deltaTime);
  }

  /** Calculate until the physics is stable and update the model information. */
  public stabilization(): void {
    if (this.rig == null) {
      return;
    }

    this.rig.stabilization();

    const renderController = this.getComponent(CubismRenderController);
    const maskController = this.getComponent(CubismMaskController);

    console.assert(renderController != null);

    renderController?.onLateUpdate();
    maskController?.onLateUpdate();
  }

  /** ICubismUpdatable Binded callback function. */
  public readonly bindedOnLateUpdate: ICubismUpdatable.CallbackFunction =
    this.onLateUpdate.bind(this);

  /** ICubismUpdatable metadata */
  public readonly [ICubismUpdatable.SYMBOL]: typeof ICubismUpdatable.SYMBOL =
    ICubismUpdatable.SYMBOL;

  public initialize(rig: CubismPhysicsRig) {
    this.rig = rig;
    this.onLoad();
  }

  public onLoad() {
    // Check rig existence.
    if (this.rig == null) {
      return;
    }

    // Initialize rig.
    this.rig.controller = this;
    const subRigs = this.rig.subRigs;
    for (let i = 0; i < subRigs.length; i++) {
      const subRig = subRigs[i];
      if (subRig != null) {
        subRig.rig = this.rig;
      }
    }

    this.parameters = ComponentExtensionMethods.findCubismModel(this)?.parameters ?? null;

    this.rig.initialize();
  }

  public start() {
    // Get cubism update controller.
    this.hasUpdateController = this.getComponent(CubismUpdateController) != null;
  }

  protected lateUpdate(deltaTime: number) {
    if (!this.hasUpdateController) {
      this.onLateUpdate(deltaTime);
    }
  }
}
