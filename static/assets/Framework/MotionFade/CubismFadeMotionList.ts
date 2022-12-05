/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

import { Asset, CCInteger, _decorator } from 'cc';
import CubismFadeMotionData from './CubismFadeMotionData';
const { ccclass, property } = _decorator;

// TODO: [CreateAssetMenu(menuName = "Live2D Cubism/Fade Motion List")]
/** from ScriptableObject */
@ccclass('CubismFadeMotionList')
export default class CubismFadeMotionList extends Asset {
  @property([CCInteger])
  public motionInstanceIds: number[] = new Array();

  @property([CubismFadeMotionData])
  public cubismFadeMotionObjects: CubismFadeMotionData[] = new Array();
}
