/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

import { Component, Enum, _decorator } from 'cc';
import CubismRaycastablePrecision from './CubismRaycastablePrecision';
const { ccclass, property } = _decorator;

/**
 * Allows raycasting against {@link CubismDrawable}s.
 *
 * ** Sealed class **
 */
@ccclass('CubismRaycastable')
export default class CubismRaycastable extends Component {
  /** The precision. */
  @property({
    type: Enum(CubismRaycastablePrecision),
    serializable: true,
    visible: true,
    readonly: false,
  })
  public precision: CubismRaycastablePrecision = CubismRaycastablePrecision.boundingBox;
}
