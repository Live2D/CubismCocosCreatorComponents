/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

import { Component, _decorator } from 'cc';
const { ccclass, property } = _decorator;

/** Get the parameter name from cdi3.json and save the display name. */
@ccclass('CubismDisplayInfoParameterName')
export default class CubismDisplayInfoParameterName extends Component {
  /** Name for display that can be changed by the user. */
  @property({
    visible: true,
    readonly: false,
    serializable: true,
    group: 'Main',
  })
  public displayName: string = '';

  /** Original name of the parameter from cdi3.json. */
  @property({
    visible: true,
    readonly: true,
    serializable: true,
    group: 'Debug',
  })
  public parameterName: string = ''; // CubismDisplayInfoParameterName.Name
}
