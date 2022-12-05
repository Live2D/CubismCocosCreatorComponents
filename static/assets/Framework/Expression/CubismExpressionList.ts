/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

import { Asset, _decorator } from 'cc';
import CubismExpressionData from './CubismExpressionData';
const { ccclass, property } = _decorator;

@ccclass('CubismExpressionList')
export default class CubismExpressionList extends Asset {
  /** Cubism expression objects. */
  @property({ type: [CubismExpressionData], serializable: true })
  public cubismExpressionObjects: CubismExpressionData[] = new Array(0);
}
