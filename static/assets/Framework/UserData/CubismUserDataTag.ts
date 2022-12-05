/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

import { Component, _decorator } from 'cc';
import CubismUserDataBody from './CubismUserDataBody';
const { ccclass, property } = _decorator;

// TODO: CubismDontMoveOnReimport
/** Tag of user data. */
@ccclass('CubismUserDataTag')
export default class CubismUserDataTag extends Component {
  /** Value backing field. */
  @property({ serializable: true, visible: false })
  private _value: string = '';

  /** Value. */
  @property({ visible: true, readonly: false })
  public get value() {
    if (this._value == null || this._value == '') {
      this._value = this.body?.value ?? '';
    }
    return this._value;
  }
  private set value(value: string) {
    this._value = value;
  }

  /** Body backing field. */
  @property({ serializable: true, visible: false })
  private _body: CubismUserDataBody = new CubismUserDataBody();

  /** Body. */
  private get body() {
    return this._body;
  }
  private set body(body: CubismUserDataBody) {
    this._body = body;
  }

  /**
   * Initializes tag.
   * @param body Body for initialization.
   */
  public initialize(body: CubismUserDataBody) {
    this.body = body;
  }
}
