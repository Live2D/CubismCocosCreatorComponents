/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

import { Component, _decorator } from 'cc';
const { ccclass, property } = _decorator;

/** Get the part name from cdi3.json and save the display name. */
@ccclass('CubismDisplayInfoPartName')
export default class CubismDisplayInfoPartName extends Component {
  // Cocos の Component API と name が衝突するため partName へ変更
  /** Original name of the part from cdi3.json. */
  @property({ serializable: true, visible: false })
  public partName: string = '';

  /** Name for display that can be changed by the user. */
  @property({ serializable: true, visible: true })
  public displayName: string = '';
}
