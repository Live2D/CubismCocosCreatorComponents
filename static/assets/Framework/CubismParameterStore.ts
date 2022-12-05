/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

import { Component, _decorator } from 'cc';
import ComponentExtensionMethods from '../Core/ComponentExtensionMethods';
import CubismUpdateController from './CubismUpdateController';
import CubismUpdateExecutionOrder from './CubismUpdateExecutionOrder';
import ICubismUpdatable from './ICubismUpdatable';
import type CubismParameter from '../Core/CubismParameter';
import type CubismPart from '../Core/CubismPart';
const { ccclass, property } = _decorator;

@ccclass('CubismParameterStore')
export default class CubismParameterStore extends Component implements ICubismUpdatable {
  private _destinationParameters: CubismParameter[] | null = null;
  public get destinationParameters() {
    return this._destinationParameters;
  }
  public set destinationParameters(value: CubismParameter[] | null) {
    this._destinationParameters = value;
  }

  private _destinationParts: CubismPart[] | null = null;
  public get destinationParts() {
    return this._destinationParts;
  }
  public set destinationParts(value: CubismPart[] | null) {
    this._destinationParts = value;
  }

  private _parameterValues: number[] | null = null;

  private _partOpacities: number[] | null = null;

  @property({ serializable: false, visible: false })
  private _hasUpdateController: boolean = false;
  public get hasUpdateController() {
    return this._hasUpdateController;
  }
  public set hasUpdateController(value: boolean) {
    this._hasUpdateController = value;
  }

  public get executionOrder(): number {
    return CubismUpdateExecutionOrder.CUBISM_PARAMETER_STORE_SAVE_PARAMETERS;
  }

  public get needsUpdateOnEditing(): boolean {
    return false;
  }

  public refresh() {
    if (this.destinationParameters == null) {
      this.destinationParameters =
        ComponentExtensionMethods.findCubismModel(this)?.parameters ?? null;
    }

    if (this.destinationParts == null) {
      this.destinationParts = ComponentExtensionMethods.findCubismModel(this)?.parts ?? null;
    }

    // Get cubism update controller.
    this.hasUpdateController = this.getComponent(CubismUpdateController) != null;

    this.saveParameters();
  }

  protected onLateUpdate(deltaTime: number) {
    if (!this.hasUpdateController) {
      return;
    }

    this.saveParameters();
  }

  /** ICubismUpdatable Binded callback function. */
  public readonly bindedOnLateUpdate: ICubismUpdatable.CallbackFunction =
    this.onLateUpdate.bind(this);
  /** ICubismUpdatable metadata */
  public readonly [ICubismUpdatable.SYMBOL]: typeof ICubismUpdatable.SYMBOL =
    ICubismUpdatable.SYMBOL;

  public saveParameters() {
    // Fail silently...
    if (!this.enabled) {
      return;
    }

    // save parameters value
    if (this.destinationParameters != null && this._parameterValues == null) {
      this._parameterValues = new Array<number>(this.destinationParameters.length);
    }

    if (this._parameterValues != null && this.destinationParameters != null) {
      for (let i = 0; i < this._parameterValues.length; ++i) {
        if (this.destinationParameters[i] != null) {
          this._parameterValues[i] = this.destinationParameters[i].value;
        }
      }
    }

    // save parts opacity
    if (this.destinationParts != null && this._partOpacities == null) {
      this._partOpacities = new Array(this.destinationParts.length);
    }

    if (this._partOpacities != null && this.destinationParts != null) {
      for (let i = 0; i < this._partOpacities.length; ++i) {
        this._partOpacities[i] = this.destinationParts[i].opacity;
      }
    }
  }

  public restoreParameters() {
    // Fail silently...
    if (!this.enabled) {
      return;
    }

    // restore parameters value
    if (this._parameterValues != null && this.destinationParameters != null) {
      for (let i = 0; i < this._parameterValues.length; ++i) {
        this.destinationParameters[i].value = this._parameterValues[i];
      }
    }

    // restore parts opacity
    if (this._partOpacities != null && this.destinationParts != null) {
      for (let i = 0; i < this._partOpacities.length; ++i) {
        this.destinationParts[i].opacity = this._partOpacities[i];
      }
    }
  }

  onEnable() {
    // Initialize cache.
    this.refresh();
  }
}
