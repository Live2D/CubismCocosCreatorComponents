/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

import { CCFloat, _decorator } from 'cc';
import CubismFadeMotionData from './CubismFadeMotionData';
const { property } = _decorator;

/** from struct */
export default class CubismFadePlayingMotion {
  @property(CCFloat)
  public startTime: number = 0;

  @property(CCFloat)
  public endTime: number = 0;

  @property(CCFloat)
  public fadeInStartTime: number = 0;

  @property({ type: Number, slide: true, min: 0.0, max: Number.MAX_VALUE })
  public speed: number = 0;

  @property(CubismFadeMotionData)
  public motion: CubismFadeMotionData | null = null;

  @property(Boolean)
  public isLooping: boolean = false;

  @property({ serializable: false, visible: false })
  public weight: number = 0;
}
