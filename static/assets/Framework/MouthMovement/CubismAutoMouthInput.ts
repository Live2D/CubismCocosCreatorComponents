/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

import { Component, CCFloat, _decorator } from 'cc';
import CubismMouthController from './CubismMouthController';
const { ccclass, property } = _decorator;

@ccclass('CubismAutoMouthInput')
export default class CubismAutoMouthInput extends Component {
  @property(CCFloat)
  public Timescale: number = 10.0;

  private _Controller: CubismMouthController | null = null;
  private get Controller() {
    return this._Controller;
  }
  private set Controller(value: CubismMouthController | null) {
    this._Controller = value;
  }

  private _T: number = 0;
  private get T() {
    return this._T;
  }
  private set T(value: number) {
    this._T = value;
  }

  public resetInEditor() {
    this.T = 0.0;
  }

  start() {
    this.Controller = this.getComponent(CubismMouthController);
  }

  lateUpdate(deltaTime: number) {
    // Fail silently.
    if (this.Controller == null) {
      return;
    }

    // Progress time.
    this.T += deltaTime * this.Timescale;

    // Evaluate.
    this.Controller.mouthOpening = Math.abs(Math.sin(this.T));
  }
}
