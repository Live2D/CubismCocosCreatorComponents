/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

import { math, _decorator } from 'cc';
import CubismPhysics from './CubismPhysics';
import CubismPhysicsController from './CubismPhysicsController';
import CubismPhysicsSubRig from './CubismPhysicsSubRig';
const { property, ccclass } = _decorator;

/** Physics rig. */
@ccclass('CubismPhysicsRig')
export default class CubismPhysicsRig {
  /** Children of rig. */
  @property({ type: [CubismPhysicsSubRig], serializable: true })
  subRigs: Array<CubismPhysicsSubRig | null> = new Array(0);

  @property({ serializable: true })
  gravity: math.Vec2 = CubismPhysics.gravity;

  @property({ serializable: true })
  wind: math.Vec2 = CubismPhysics.wind;

  private _controller: CubismPhysicsController | null = null;
  /** Reference of controller to refer from children rig. */
  public get controller() {
    return this._controller;
  }
  /** Reference of controller to refer from children rig. */
  public set controller(value: CubismPhysicsController | null) {
    this._controller = value;
  }

  /** Initializes rigs. */
  public initialize() {
    for (let i = 0; i < this.subRigs.length; i++) {
      this.subRigs[i]?.initialize();
    }
  }

  /** Evaluate rigs. */
  public evaluate(deltaTime: number) {
    for (let i = 0; i < this.subRigs.length; i++) {
      this.subRigs[i]?.evaluate(deltaTime);
    }
  }
}
